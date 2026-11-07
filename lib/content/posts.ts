/**
 * Insights articles. Mirrors the planned `posts` table; `content` is Markdown
 * so the same renderer works when posts move to Supabase in Phase 4.
 */

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string; // ISO date
  author: string;
  content: string;
};

export const posts: Post[] = [
  {
    slug: "why-your-business-needs-a-whatsapp-ai-assistant",
    title: "Why your business needs a WhatsApp AI assistant",
    excerpt:
      "Your customers are already on WhatsApp. Here's how an AI assistant turns unanswered messages into bookings and sales, and how to roll one out without losing the human touch.",
    category: "AI automation",
    publishedAt: "2026-10-28",
    author: "Nerologik team",
    content: `For most businesses in Ghana, WhatsApp is the front door. Customers ask about prices, delivery, opening hours and availability there long before they visit a website or call.

The problem is simple: **messages arrive at all hours, and most teams can't answer them all.** Every slow reply is a customer who might buy somewhere else.

## What an AI assistant actually does

A well-built WhatsApp assistant is not a rigid menu bot that says "Reply 1 for prices". It understands normal questions, in normal language, and can:

- Answer common questions about products, prices and policies
- Take orders or booking requests and capture the customer's details
- Send payment links and confirmations
- Pass the conversation to a person when it needs a human

## Where it pays off first

Start with the questions your team answers ten times a day. Delivery areas, prices, availability and "are you open?" are perfect for automation. They're repetitive, the answers are known, and speed matters.

## Keep it human

The best assistants are honest about being assistants. Give yours a friendly tone that matches your brand, keep answers short, and make it easy to reach a person. Automation should free your team for the conversations that need them, not hide your team away.

## Getting started

1. List the 20 questions you're asked most often, with your best answers
2. Decide what "done" looks like: an order, a booking or a qualified lead
3. Start with one channel and one goal, then expand

If you'd like to see one in action, [try our demo assistant on WhatsApp](https://wa.me/233270000004).`,
  },
  {
    slug: "designing-apps-that-work-on-any-network",
    title: "Designing apps that work on any network",
    excerpt:
      "Fibre in Accra, 3G on the road to Tamale. Practical techniques we use to make websites and apps fast and reliable for every user, whatever their connection.",
    category: "Engineering",
    publishedAt: "2026-10-14",
    author: "Nerologik team",
    content: `It's easy to build a product that feels fast on office Wi-Fi. The real test is a mid-range phone on a patchy mobile connection, which describes a large share of users across Africa.

Here are the principles we build by.

## 1. Ship less JavaScript

Every kilobyte has to be downloaded, parsed and run on the user's device. We render on the server wherever we can, load interactive pieces only when they're needed, and question every new dependency.

## 2. Make images earn their place

Images are usually the heaviest part of a page. Serve modern formats like WebP and AVIF, size images for the screen they're shown on, and lazy-load anything below the fold.

## 3. Design for the slow path

Show useful content immediately, then enhance. Skeleton states, optimistic updates and clear loading feedback make a slow connection feel responsive instead of broken.

## 4. Expect the connection to drop

Forms should never lose what a user typed. Payments should be safe to retry. Where it matters, offline support and background sync let people keep working until the signal returns.

## 5. Measure on real devices

Lab scores are a starting point. Test on the phones your customers actually use, on throttled networks, and track Core Web Vitals from real visits.

## The payoff

Fast products convert better, rank better on Google and cost users less mobile data. In markets where data is expensive, that respect for your users' bundle is a competitive advantage.`,
  },
  {
    slug: "how-to-scope-a-software-project",
    title: "How to scope a software project without blowing your budget",
    excerpt:
      "Most software budgets aren't blown by bad code. They're blown by unclear scope. A simple framework to plan your first version, get accurate quotes and launch on time.",
    category: "Strategy",
    publishedAt: "2026-09-30",
    author: "Nerologik team",
    content: `Ask three agencies to quote "an app like Uber, but for laundry" and you'll get three wildly different numbers. That's not because two of them are wrong. It's because the scope is unclear.

Here's the framework we use with every client before writing a line of code.

## Start with the outcome, not the features

"We need an app" is a solution. "Customers should be able to book and pay for a pickup in under two minutes" is an outcome. Outcomes let you judge every feature by one question: does this help?

## Define your first version ruthlessly

List every feature you can imagine, then sort them into three groups:

- **Must have:** the product doesn't work without it
- **Should have:** valuable, but launch can happen without it
- **Later:** good ideas for version two

Your first release is the must-haves only. Getting real users sooner beats a perfect product launched late.

## Be specific about integrations

Payments (MoMo, card, Paystack), SMS, WhatsApp, maps and accounting tools each add real work. Name them early so your quote includes them.

## Ask for a fixed scope and a clear timeline

A good partner should be able to say what's included, what isn't, and what happens if things change. Weekly demos keep everyone honest and mean surprises show up early, while they're still cheap.

## Plan for after launch

Hosting, maintenance, support and marketing are part of the real cost. Budget for at least the first few months after launch, because that's when you'll learn the most.

Want help scoping your project? [Book a free call](/contact) and we'll map it out together.`,
  },
];
