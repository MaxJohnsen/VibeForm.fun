import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TemplateVariable } from '@/shared/utils/templateEngine';

interface VariablePickerProps {
  variables: TemplateVariable[];
  onSelect: (variableKey: string) => void;
}

export const VariablePicker = ({ variables, onSelect }: VariablePickerProps) => {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  const filteredVariables = variables.filter(
    v =>
      v.label.toLowerCase().includes(search.toLowerCase()) ||
      v.key.toLowerCase().includes(search.toLowerCase())
  );

  const formVars = filteredVariables.filter(v => v.category === 'form');
  const questionVars = filteredVariables.filter(v => v.category === 'question');
  const specialVars = filteredVariables.filter(v => v.category === 'special');

  const handleSelect = (key: string) => {
    onSelect(`{{${key}}}`);
    setOpen(false);
    setSearch('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Search className="h-3.5 w-3.5" />
          Insert Variable
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0" align="start">
        <div className="p-2 border-b border-border/50">
          <Input
            placeholder="Search variables..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9"
          />
        </div>

        <ScrollArea className="h-[320px]">
          <div className="p-2 space-y-3">
            {formVars.length > 0 && (
              <div>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  FORM VARIABLES
                </div>
                <div className="space-y-0.5">
                  {formVars.map((variable) => (
                    <button
                      key={variable.key}
                      onClick={() => handleSelect(variable.key)}
                      className="w-full text-left px-2 py-1.5 rounded-md hover:bg-accent/50 transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {variable.label}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {`{{${variable.key}}}`}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground italic opacity-0 group-hover:opacity-100 transition-opacity">
                          {variable.example}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {questionVars.length > 0 && (
              <div>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  QUESTION ANSWERS
                </div>
                <div className="space-y-0.5">
                  {questionVars.map((variable) => (
                    <button
                      key={variable.key}
                      onClick={() => handleSelect(variable.key)}
                      className="w-full text-left px-2 py-1.5 rounded-md hover:bg-accent/50 transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {variable.label}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {`{{${variable.key}}}`}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground italic opacity-0 group-hover:opacity-100 transition-opacity">
                          {variable.example}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {specialVars.length > 0 && (
              <div>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  SPECIAL VARIABLES
                </div>
                <div className="space-y-0.5">
                  {specialVars.map((variable) => (
                    <button
                      key={variable.key}
                      onClick={() => handleSelect(variable.key)}
                      className="w-full text-left px-2 py-1.5 rounded-md hover:bg-accent/50 transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {variable.label}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {`{{${variable.key}}}`}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {filteredVariables.length === 0 && (
              <div className="px-2 py-8 text-center text-sm text-muted-foreground">
                No variables found
              </div>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
