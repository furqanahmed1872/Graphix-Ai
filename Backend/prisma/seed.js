// Backend/prisma/seed.js — idempotent seed for global (non-user) tables.
import prisma from "./client.js";

const templates = [
  { title: "Monthly Revenue",    category: "Business",  description: "Track revenue trends over months",       trend: "+12.4%", isTrending: true,  tag: "Finance",   chartCount: 6 },
  { title: "User Growth",        category: "Analytics", description: "Visualize user acquisition over time",   trend: "+8.1%",  isTrending: true,  tag: "Growth",    chartCount: 5 },
  { title: "Sales by Region",    category: "Business",  description: "Compare sales across different regions", trend: "+5.3%",  isTrending: false, tag: "Business",  chartCount: 4 },
  { title: "Website Traffic",    category: "Analytics", description: "Monitor page visits and sessions",       trend: "+22.7%", isTrending: true,  tag: "Marketing", chartCount: 7 },
  { title: "Product Comparison", category: "Marketing", description: "Side-by-side product metrics",           trend: "-1.2%",  isTrending: false, tag: "Product",   chartCount: 5 },
  { title: "Expense Breakdown",  category: "Finance",   description: "Pie chart of spending categories",       trend: "+0.8%",  isTrending: false, tag: "Finance",   chartCount: 4 },
];

const feedbacks = [
  { authorName: "Alex Kim",       message: "Graphix turned our CSV data into beautiful dashboards instantly. Game changer!", rating: 5 },
  { authorName: "Sarah Chen",     message: "The AI understands exactly what chart I need. Incredibly intuitive.",            rating: 5 },
  { authorName: "Marcus Johnson", message: "Saved hours of work every week. The templates are spot-on.",                    rating: 4 },
  { authorName: "Priya Patel",    message: "Best data viz tool I have used. Our presentations look so professional now.",   rating: 5 },
];

async function main() {
  if ((await prisma.graphTemplate.count()) === 0) {
    await prisma.graphTemplate.createMany({ data: templates });
    console.log(`Seeded ${templates.length} graph templates.`);
  } else {
    console.log("Graph templates already present — skipped.");
  }

  if ((await prisma.feedback.count()) === 0) {
    await prisma.feedback.createMany({ data: feedbacks });
    console.log(`Seeded ${feedbacks.length} feedbacks.`);
  } else {
    console.log("Feedbacks already present — skipped.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
