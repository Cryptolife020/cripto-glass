import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

const CustomSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => {
  // Calcular a porcentagem com base no valor atual
  const value = props.value?.[0] || 0;
  const max = props.max || 100;
  const percent = (value / max) * 100;
  
  // Estilo de gradiente estático para melhor desempenho
  const gradientStyle = {
    background: `linear-gradient(to right, 
      #FFCC70 0%, 
      #C850C0 ${percent/4}%, 
      #4158D0 ${percent}%, 
      #3b3b3b ${percent}%, 
      #3b3b3b 100%)`,
    width: '100%'
  };

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        className="relative h-3 w-full grow overflow-hidden rounded-full bg-[#3b3b3b]"
      >
        <SliderPrimitive.Range
          className="absolute h-full"
          style={gradientStyle}
        />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        className="block w-5 h-5 rounded-full border-2 border-white bg-[#818bf9] shadow-md cursor-pointer disabled:pointer-events-none disabled:opacity-50"
      />
    </SliderPrimitive.Root>
  );
});
CustomSlider.displayName = SliderPrimitive.Root.displayName;

export { CustomSlider };