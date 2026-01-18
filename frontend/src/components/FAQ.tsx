"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const faqs = [
  {
    question: "Is DoIt suitable for enterprise teams?",
    answer: "Absolutely. DoIt is designed to scale with your organization, offering role-based access control, SSO integration, and audit logs for compliance."
  },
  {
    question: "Which integrations does it support?",
    answer: "We support over 50+ integrations including GitHub, GitLab, Jira, Slack, Discord, and VS Code. Our API allows for custom webhooks as well."
  },
  {
    question: "How does the pricing model work?",
    answer: "We offer a generous free tier for individuals. For teams, we have a simple per-seat pricing model. No hidden fees, cancel anytime."
  },
  {
    question: "Can I use DoIt offline?",
    answer: "Yes, our desktop application supports full offline mode. Changes sync automatically when you reconnect to the internet."
  },
  {
    question: "Is my data secure?",
    answer: "Security is our priority. We use AES-256 encryption at rest and TLS 1.3 in transit. We are SOC2 Type II compliant."
  },
  {
    question: "Can I customize the Kanban workflows?",
    answer: "Yes, you can create custom column states, set WIP limits, and automate transitions based on triggers like pull request status."
  },
  {
    question: "Does it integrate with GitHub?",
    answer: "Seamlessly. Link issues to cards, automate movement based on PR merges, and see build statuses directly on your board."
  },
  {
    question: "What if I need support?",
    answer: "We offer 24/7 priority support for Pro and Enterprise plans. Our documentation is extensive and community forums are always active."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-secondary/20 py-24 border-b-2 border-foreground">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-black uppercase tracking-tighter text-foreground mb-4">
            FAQs
          </h2>
          <p className="text-lg font-medium text-muted-foreground">
            Common questions about DoIt and how to master your workflow.
          </p>
        </div>

        <div className="flex flex-col border-2 border-foreground bg-white shadow-hard">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`border-b border-foreground/10 last:border-b-0 transition-colors ${openIndex === index ? 'bg-secondary/10' : ''}`}
            >
              <button
                className="flex w-full items-center justify-between px-6 py-5 text-left focus:outline-none group"
                onClick={() => toggleFAQ(index)}
              >
                <span className="font-bold text-foreground pr-8 group-hover:text-primary transition-colors">
                  {faq.question}
                </span>
                {openIndex === index ? (
                  <ChevronUp className="h-5 w-5 flex-shrink-0 text-primary" />
                ) : (
                  <ChevronDown className="h-5 w-5 flex-shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                )}
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-6 pb-6 text-sm leading-relaxed text-muted-foreground">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
