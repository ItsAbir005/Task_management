import React from "react";
import { motion } from "framer-motion";

const testimonials = [
  {
    content: "We switched from a massive legacy HR platform. SyncHR is so much faster, and our team actually uses it without complaining.",
    author: "David L.",
    role: "VP of Engineering",
    avatar: "https://i.pravatar.cc/100?img=11"
  },
  {
    content: "The dynamic routing based on roles is incredible. As an Admin, I have full control, but the employee view remains completely uncluttered.",
    author: "Sarah M.",
    role: "Head of Operations",
    avatar: "https://i.pravatar.cc/100?img=12"
  },
  {
    content: "Finally, leave management that makes sense. The one-click approvals have saved me hours of email back-and-forth every single week.",
    author: "James K.",
    role: "HR Director",
    avatar: "https://i.pravatar.cc/100?img=13"
  },
  {
    content: "Tying projects to employee profiles natively inside the HR app is a game changer for resource allocation. Highly recommend.",
    author: "Elena T.",
    role: "Product Manager",
    avatar: "https://i.pravatar.cc/100?img=9"
  },
];

const TestimonialCard = ({ content, author, role, avatar }) => (
  <div className="min-w-[320px] md:min-w-[400px] bg-white/5 border border-white/10 p-8 rounded-3xl mx-3 hover:bg-white-[0.07] transition-colors">
    <div className="flex text-amber-400 mb-6 gap-1">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}
    </div>
    <p className="text-slate-300 font-light text-lg italic mb-8 leading-relaxed">"{content}"</p>
    <div className="flex items-center gap-4">
      <img src={avatar} alt={author} className="w-12 h-12 rounded-full grayscale hover:grayscale-0 transition-all border border-white/20" />
      <div>
        <h4 className="text-white font-medium">{author}</h4>
        <p className="text-slate-400 text-sm">{role}</p>
      </div>
    </div>
  </div>
);

const Testimonials = () => {
  // Duplicate for seamless loop
  const scrollItems = [...testimonials, ...testimonials];

  return (
    <section id="testimonials" className="py-24 bg-slate-950 border-t border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-16 text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
          Don't just take our word for it.
        </h2>
        <p className="text-slate-400 font-light text-lg">
          Join thousands of modern teams managing their workforce effectively.
        </p>
      </div>

      <div className="relative flex overflow-x-hidden group">
        <motion.div 
          className="flex whitespace-nowrap py-4"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            ease: "linear",
            duration: 25,
            repeat: Infinity,
          }}
        >
          {scrollItems.map((item, idx) => (
             <TestimonialCard key={idx} {...item} />
          ))}
        </motion.div>
        
        {/* Gradient fades on edges */}
        <div className="absolute top-0 bottom-0 left-0 w-32 bg-gradient-to-r from-slate-950 to-transparent pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-32 bg-gradient-to-l from-slate-950 to-transparent pointer-events-none" />
      </div>
    </section>
  );
};

export default Testimonials;
