import { Order } from "../models/Order.ts";
import { Artisan } from "../models/Artisan.ts";

export const adminService = {
  async getDashboardOverview(range: "6months" | "1year") {
    const now = new Date();
    const monthsToLookBack = range === "6months" ? 6 : 12;
    const startDate = new Date(
      now.getFullYear(),
      now.getMonth() - monthsToLookBack + 1,
      1,
    );

    // 1. Stats Calculation
    const [
      totalRevenueResult,
      activeArtisans,
    ] = await Promise.all([
      Order.aggregate([
        { $match: { status: "paid" } },
        { $group: { _id: null, total: { $sum: "$totals.grandTotal" } } },
      ]),
      Artisan.countDocuments({ status: "published" }),
    ]);

    const totalRevenue = totalRevenueResult[0]?.total || 0;

    // 2. Revenue Chart Data
    const revenueChart = await Order.aggregate([
      {
        $match: {
          status: "paid",
          placedAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$placedAt" },
            month: { $month: "$placedAt" },
          },
          revenue: { $sum: "$totals.grandTotal" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Format chart data for easier consumption
    const formattedChart = revenueChart.map((item: any) => ({
      date: new Date(item._id.year, item._id.month - 1).toISOString(),
      amount: item.revenue,
    }));

    // 4. Recent Orders
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5)
      .lean();

    return {
      stats: {
        totalSales: totalRevenue,
        orderCount: await Order.countDocuments(),
        artisanCount: activeArtisans,
        activeProducts: await Artisan.countDocuments({ status: "published" }), // Placeholder logic
      },
      salesHistory: formattedChart,
      recentOrders: recentOrders as any[],
    };
  },
};
