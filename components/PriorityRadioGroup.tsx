import { Translations } from "../types/translations.ts";

interface PriorityRadioGroupProps {
  value: string;
  onChange: (e: Event) => void;
  translations: Translations;
}

export default function PriorityRadioGroup({ value, onChange, translations }: PriorityRadioGroupProps) {
  return (
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 grid-auto-rows-1fr">
      <label class="relative cursor-pointer h-full">
        <input
          type="radio"
          name="priority"
          value="critical"
          checked={value === "critical"}
          onChange={onChange}
          class="peer sr-only"
        />
        <div class="input-field h-full flex flex-col items-center justify-center p-4 rounded-lg border-2 border-transparent bg-white hover:border-[#8E8F1D]/30 peer-checked:border-[#8E8F1D] peer-checked:bg-[#8E8F1D]/5 peer-checked:shadow-md transition-all duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span class="mt-2 font-medium text-center text-red-600">{translations.priority_levels?.critical}</span>
        </div>
      </label>
      <label class="relative cursor-pointer h-full">
        <input
          type="radio"
          name="priority"
          value="high"
          checked={value === "high"}
          onChange={onChange}
          class="peer sr-only"
        />
        <div class="input-field h-full flex flex-col items-center justify-center p-4 rounded-lg border-2 border-transparent bg-white hover:border-[#8E8F1D]/30 peer-checked:border-[#8E8F1D] peer-checked:bg-[#8E8F1D]/5 peer-checked:shadow-md transition-all duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span class="mt-2 font-medium text-center text-orange-500">{translations.priority_levels?.high}</span>
        </div>
      </label>
      <label class="relative cursor-pointer h-full">
        <input
          type="radio"
          name="priority"
          value="medium"
          checked={value === "medium"}
          onChange={onChange}
          class="peer sr-only"
        />
        <div class="input-field h-full flex flex-col items-center justify-center p-4 rounded-lg border-2 border-transparent bg-white hover:border-[#8E8F1D]/30 peer-checked:border-[#8E8F1D] peer-checked:bg-[#8E8F1D]/5 peer-checked:shadow-md transition-all duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="mt-2 font-medium text-center text-yellow-500">{translations.priority_levels?.medium}</span>
        </div>
      </label>
      <label class="relative cursor-pointer h-full">
        <input
          type="radio"
          name="priority"
          value="low"
          checked={value === "low"}
          onChange={onChange}
          class="peer sr-only"
        />
        <div class="input-field h-full flex flex-col items-center justify-center p-4 rounded-lg border-2 border-transparent bg-white hover:border-[#8E8F1D]/30 peer-checked:border-[#8E8F1D] peer-checked:bg-[#8E8F1D]/5 peer-checked:shadow-md transition-all duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
          <span class="mt-2 font-medium text-center text-blue-500">{translations.priority_levels?.low}</span>
        </div>
      </label>
    </div>
  );
} 