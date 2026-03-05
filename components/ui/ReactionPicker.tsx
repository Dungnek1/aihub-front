"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import { useSpring, animated, config } from "@react-spring/web";
import { ReactionEmoji } from "@/components/ui/ReactionEmoji";
import { cn } from "@/lib/utils";

interface Reaction {
  type: string;
  emoji?: string;
  icon?: string;
  label: string;
}

interface ReactionPickerProps {
  reactions: Reaction[];
  isOpen: boolean;
  onSelect: (reactionType: string) => void;
  onClose: () => void;
  position?: "top" | "bottom";
  align?: "left" | "center" | "right";
  className?: string;
  selectedReaction?: string | null;
}

// Component riêng cho mỗi emoji button để dùng hooks
function ReactionButton({
  reaction,
  index,
  isSelected,
  isClicked,
  onSelect,
}: {
  reaction: Reaction;
  index: number;
  isSelected: boolean;
  isClicked: boolean;
  onSelect: (type: string, e: React.MouseEvent) => void;
}) {
  // React Spring cho mỗi emoji button - animation mượt mà hơn
  const buttonSpring = useSpring({
    scale: isClicked ? 1.4 : isSelected ? 1.15 : 1,
    y: isClicked ? -10 : 0,
    rotate: 0, // Bỏ rotate array để tránh lỗi animation
    config: { tension: 400, friction: 25 },
  });

  // Removed glowSpring to avoid animation array issues
  // const glowSpring = useSpring({
  //   opacity: isClicked ? [0, 1, 0.9, 0] : 0,
  //   scale: isClicked ? [1, 2, 1.8, 1] : 1,
  //   config: { duration: 600 },
  // });

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ 
        delay: index * 0.05,
        duration: 0.2,
        ease: [0.34, 1.56, 0.64, 1],
      }}
    >
      <animated.button
        style={{
          transform: buttonSpring.scale.to((s) => `scale(${s}) translateY(${buttonSpring.y.to((y) => `${y}px`)})`),
        }}
        onClick={(e) => onSelect(reaction.type, e)}
        className={cn(
          "group relative w-10 h-10 sm:w-14 sm:h-14 rounded-full",
          "transition-all duration-300 cursor-pointer",
          "flex items-center justify-center",
          "backdrop-blur-sm overflow-hidden",
          isSelected 
            ? "bg-gradient-to-br from-white/10 to-white/5"
            : "hover:bg-gradient-to-br hover:from-white/10 hover:to-white/5",
          isClicked && "bg-gradient-to-br from-white/15 to-white/10"
        )}
        title={reaction.label}
      >
      {/* Animated emoji với Framer Motion cho rotate */}
                <motion.div
                  animate={isClicked ? {
                    rotate: [0, -20, 20, -20, 0],
                    scale: 1.25,
                  } : {
                    scale: 1,
                  }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="flex items-center justify-center"
                >
                  <ReactionEmoji
                    type={reaction.type as any}
                    size={isClicked ? 32 : isSelected ? 28 : 24}
                    animated={true}
                    className={cn(
                      "transition-all duration-300 group-hover:scale-125",
                      isSelected && "scale-110",
                      isClicked && "scale-125"
                    )}
                  />
                </motion.div>


      {/* Sparkle particles effect */}
      {isClicked && (
        <>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 bg-cyan-400 rounded-full"
              initial={{
                x: '50%',
                y: '50%',
                scale: 0,
                opacity: 1,
              }}
              animate={{
                x: `${50 + (Math.cos((i * 60) * Math.PI / 180) * 30)}%`,
                y: `${50 + (Math.sin((i * 60) * Math.PI / 180) * 30)}%`,
                scale: [0, 1, 0],
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: 0.6,
                delay: i * 0.05,
                ease: "easeOut",
              }}
            />
          ))}
        </>
      )}



      {/* Shimmer effect on hover */}
      <motion.div
        className="absolute inset-0 rounded-full overflow-hidden"
        initial={{ x: '-100%' }}
        whileHover={{
          x: '100%',
          transition: { duration: 0.6, repeat: Infinity, repeatDelay: 1 },
        }}
      >
        <div className="w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </motion.div>
      </animated.button>
    </motion.div>
  );
}

export function ReactionPicker({
  reactions,
  isOpen,
  onSelect,
  onClose,
  position = "top",
  align = "center",
  className,
  selectedReaction,
}: ReactionPickerProps) {
  const [clickedReaction, setClickedReaction] = useState<string | null>(null);
  const confettiRef = useRef<HTMLDivElement>(null);

  const alignClasses = {
    left: "left-0",
    center: "left-1/2 -translate-x-1/2",
    right: "right-0",
  };

  const positionClasses = {
    top: "bottom-full mb-3", // Tăng khoảng cách để dễ di chuột vào
    bottom: "top-full mt-3",
  };

  // React Spring animation cho container
  const containerSpring = useSpring({
    opacity: isOpen ? 1 : 0,
    scale: isOpen ? 1 : 0.8,
    y: isOpen ? 0 : (position === "top" ? 10 : -10),
    config: config.gentle,
  });

  const handleSelect = (reactionType: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setClickedReaction(reactionType);
    
    // Trigger confetti effect
    if (confettiRef.current) {
      createConfettiBurst(confettiRef.current);
    }
    
    // Animation delay trước khi select
    setTimeout(() => {
      onSelect(reactionType);
      setClickedReaction(null);
    }, 400);
  };

  // Confetti burst effect
  const createConfettiBurst = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const colors = ['#06b6d4', '#22d3ee', '#67e8f9', '#a5f3fc'];
    
    for (let i = 0; i < 20; i++) {
      const confetti = document.createElement('div');
      confetti.style.position = 'fixed';
      confetti.style.left = `${rect.left + rect.width / 2}px`;
      confetti.style.top = `${rect.top + rect.height / 2}px`;
      confetti.style.width = '8px';
      confetti.style.height = '8px';
      const colorIndex = Math.floor(Math.random() * colors.length);
      const color = colors[colorIndex] ?? colors[0] ?? "#06b6d4";
      confetti.style.backgroundColor = color;
      confetti.style.borderRadius = '50%';
      confetti.style.pointerEvents = 'none';
      confetti.style.zIndex = '9999';
      
      const angle = (Math.PI * 2 * i) / 20;
      const velocity = 100 + Math.random() * 50;
      const vx = Math.cos(angle) * velocity;
      const vy = Math.sin(angle) * velocity;
      
      document.body.appendChild(confetti);
      
      let x = rect.left + rect.width / 2;
      let y = rect.top + rect.height / 2;
      let opacity = 1;
      
      const animate = () => {
        x += vx * 0.1;
        y += vy * 0.1 + 2; // gravity
        opacity -= 0.02;
        
        confetti.style.left = `${x}px`;
        confetti.style.top = `${y}px`;
        confetti.style.opacity = opacity.toString();
        
        if (opacity > 0) {
          requestAnimationFrame(animate);
        } else {
          confetti.remove();
        }
      };
      
      requestAnimationFrame(animate);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <animated.div
          ref={confettiRef}
          style={{
            opacity: containerSpring.opacity,
            transform: containerSpring.scale.to((s) => `scale(${s}) translateY(${containerSpring.y.to((y) => `${y}px`)})`),
          }}
          className={cn(
            "absolute z-50 rounded-2xl px-3 py-2 sm:px-5 sm:py-3.5 flex gap-2 sm:gap-3 whitespace-nowrap",
            positionClasses[position],
            alignClasses[align],
            "bg-gradient-to-b from-[#0F1722] via-[#0D1419] to-[#0A0F18] backdrop-blur-xl",
            "border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_0_1px_rgba(6,182,212,0.1)]",
            "ring-1 ring-white/5",
            className
          )}
          onMouseEnter={(e) => {
            e.stopPropagation();
            // Không đóng khi hover vào picker
          }}
          onMouseLeave={(e) => {
            // Chỉ đóng khi rời khỏi picker hoàn toàn
            const relatedTarget = e.relatedTarget as HTMLElement;
            if (!relatedTarget || !e.currentTarget.contains(relatedTarget)) {
              onClose();
            }
          }}
        >
          {reactions.map((reaction, index) => {
            const isSelected = selectedReaction === reaction.type;
            const isClicked = clickedReaction === reaction.type;
            
            return (
              <ReactionButton
                key={reaction.type}
                reaction={reaction}
                index={index}
                isSelected={isSelected}
                isClicked={isClicked}
                onSelect={handleSelect}
              />
            );
          })}
        </animated.div>
      )}
    </AnimatePresence>
  );
}
