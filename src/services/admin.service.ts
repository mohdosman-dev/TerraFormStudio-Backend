import { Order } from '../models/Order';
import { Artisan } from '../models/Artisan';
import { Product } from '../models/Product';
import { Collection } from '../models/Collection';

export const adminService = {
  async getDashboardOverview(range: '6months' | '1year') {
    const now = new Date();
    const monthsToLookBack = range === '6months' ? 6 : 12;
    const startDate = new Date(now.getFullYear(), now.getMonth() - monthsToLookBack + 1, 1);

    // 1. Stats Calculation
    const [totalRevenueResult, activeArtisans, totalCollections, pendingOrders] = await Promise.all([
      Order.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totals.grandTotal' } } }
      ]),
      Artisan.countDocuments({ status: 'published' }),
      Collection.countDocuments({ status: 'published' }),
      Order.countDocuments({ status: 'pending_payment' })
    ]);

    const totalRevenue = totalRevenueResult[0]?.total || 0;

    // 2. Revenue Chart Data
    const revenueChart = await Order.aggregate([
      { 
        $match: { 
          status: 'paid',
          placedAt: { $gte: startDate }
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: '$placedAt' },
            month: { $month: '$placedAt' }
          },
          revenue: { $sum: '$totals.grandTotal' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Format chart data for easier consumption
    const formattedChart = revenueChart.map(item => ({
      month: new Date(item._id.year, item._id.month - 1).toLocaleString('default', { month: 'short' }),
      year: item._id.year,
      revenue: item.revenue
    }));

    // 3. Spotlight Artisan
    let spotlightArtisan = await Artisan.findOne({ isSpotlight: true, status: 'published' });
    
    if (!spotlightArtisan) {
      // Fallback to top seller of the month
      const topSellerMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const topSellerResult = await Order.aggregate([
        { $match: { status: 'paid', placedAt: { $gte: topSellerMonthStart } } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.artisanSnapshot.artisanId',
            revenue: { $sum: '$items.lineTotal' }
          }
        },
        { $sort: { revenue: -1 } },
        { $limit: 1 }
      ]);

      if (topSellerResult.length > 0) {
        spotlightArtisan = await Artisan.findById(topSellerResult[0]._id);
      } else {
        // Fallback to any random published artisan
        spotlightArtisan = await Artisan.findOne({ status: 'published' });
      }
    }

    // 4. Recent Orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return {
      stats: {
        totalRevenue,
        activeArtisans,
        totalCollections,
        pendingOrders
      },
      revenueChart: formattedChart,
      spotlight: spotlightArtisan,
      recentOrders: recentOrders.map(o => ({
        id: o._id,
        orderNumber: o.orderNumber,
        customerName: o.customer.fullName,
        artisanName: o.items[0]?.artisanSnapshot?.displayName || 'N/A',
        amount: o.totals.grandTotal,
        status: o.status,
        placedAt: o.placedAt
      }))
    };
  }
};
