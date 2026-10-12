"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion, type Transition } from "framer-motion";
import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useState,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
} from "react";

type ItemProps = {
  "data-id": string;
  className?: string;
  children?: ReactNode;
  onPointerEnter?: (event: PointerEvent) => void;
  onPointerLeave?: (event: PointerEvent) => void;
  onClick?: () => void;
  "data-checked"?: "true" | "false";
};

type AnimatedBackgroundProps = {
  children: ReactElement<ItemProps> | ReactElement<ItemProps>[];
  defaultValue?: string;
  onValueChange?: (newActiveId: string | null) => void;
  className?: string;
  transition?: Transition;
  enableHover?: boolean;
};

export default function AnimatedBackground({
  children,
  defaultValue,
  onValueChange,
  className,
  transition,
  enableHover = false,
}: AnimatedBackgroundProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const uniqueId = useId();

  const handleSetActiveId = (id: string | null) => {
    setActiveId(id);
    onValueChange?.(id);
  };

  useEffect(() => {
    if (defaultValue !== undefined) {
      setActiveId(defaultValue);
    }
  }, [defaultValue]);

  return Children.map(children, (child) => {
    if (!isValidElement<ItemProps>(child)) return child;
    const id = child.props["data-id"];

    const interactionProps = enableHover
      ? {
          onPointerEnter: (event: PointerEvent) => {
            if (event.pointerType === "touch") return;
            handleSetActiveId(id);
          },
          onPointerLeave: (event: PointerEvent) => {
            if (event.pointerType === "touch") return;
            handleSetActiveId(null);
          },
        }
      : {
          onClick: () => handleSetActiveId(id),
        };

    return cloneElement(
      child,
      {
        className: cn("relative inline-flex", child.props.className),
        "data-checked": activeId === id ? "true" : "false",
        ...interactionProps,
      },
      <>
        <AnimatePresence initial={false}>
          {activeId === id && (
            <motion.div
              layoutId={`background-${uniqueId}`}
              className={cn("absolute inset-0", className)}
              transition={transition}
            />
          )}
        </AnimatePresence>
        {/* relative so this sits above the absolute wash; z-index is ignored on a static span */}
        <span className="relative z-10 block w-full min-w-0">{child.props.children}</span>
      </>,
    );
  });
}
