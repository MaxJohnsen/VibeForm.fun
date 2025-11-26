import { useState } from 'react';
import { usePhoneInput, FlagImage, defaultCountries, parseCountry, CountryIso2 } from 'react-international-phone';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhoneInputProps {
  value: string;
  onChange: (phone: string) => void;
  defaultCountry?: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

export const PhoneInput = ({
  value,
  onChange,
  defaultCountry = 'us',
  disabled = false,
  error = false,
  className,
  autoFocus = false,
}: PhoneInputProps) => {
  const [open, setOpen] = useState(false);
  
  const { inputValue, handlePhoneValueChange, country, setCountry } = usePhoneInput({
    defaultCountry: defaultCountry as CountryIso2,
    value,
    onChange: (data) => {
      onChange(data.phone);
    },
  });

  const currentCountryTuple = defaultCountries.find((c: any) => c[1] === country);
  const currentCountry = currentCountryTuple 
    ? parseCountry(currentCountryTuple as any) 
    : parseCountry(defaultCountries[0] as any);

  return (
    <div className={cn('flex w-full', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              'flex items-center gap-2 px-3 py-3 sm:px-4 sm:py-4',
              'bg-white/50 dark:bg-white/5',
              'border rounded-l-xl',
              'hover:bg-white/70 dark:hover:bg-white/10',
              'focus:outline-none focus:ring-2 focus:ring-primary/20',
              'transition-all',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error 
                ? 'border-destructive focus:border-destructive' 
                : 'border-border/50 focus:border-primary'
            )}
          >
            <FlagImage iso2={currentCountry.iso2 as CountryIso2} className="w-5 h-5" />
            <ChevronDown className="h-4 w-4 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent 
          className="p-0 w-[280px] bg-popover/95 backdrop-blur-xl border-border/50" 
          align="start"
          sideOffset={4}
        >
          <Command className="bg-transparent">
            <CommandInput placeholder="Search countries..." className="h-9" />
            <CommandList className="max-h-[300px]">
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup>
                {defaultCountries.map((c) => {
                  const countryData = parseCountry(c as any);
                  return (
                    <CommandItem
                      key={countryData.iso2}
                      value={`${countryData.name} ${countryData.dialCode}`}
                      onSelect={() => {
                        setCountry(countryData.iso2 as CountryIso2);
                        setOpen(false);
                      }}
                      className="cursor-pointer"
                    >
                      <FlagImage iso2={countryData.iso2 as CountryIso2} className="mr-2 w-5 h-5" />
                      <span className="flex-1">{countryData.name}</span>
                      <span className="text-sm text-muted-foreground">+{countryData.dialCode}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <input
        type="tel"
        value={inputValue}
        onChange={handlePhoneValueChange}
        disabled={disabled}
        autoFocus={autoFocus}
        className={cn(
          'flex-1 px-4 py-3 sm:px-6 sm:py-4 text-base sm:text-lg',
          'bg-white/50 dark:bg-white/5',
          'border border-l-0 rounded-r-xl',
          'focus:outline-none focus:ring-2 focus:ring-primary/20',
          'transition-all',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error 
            ? 'border-destructive focus:border-destructive' 
            : 'border-border/50 focus:border-primary'
        )}
      />
    </div>
  );
};
