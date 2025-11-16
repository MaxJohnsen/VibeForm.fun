import { useEffect, useState, useRef } from 'react';
import { Question } from '../api/questionsApi';
import { QuestionLogic } from '../types/logic';

interface ArrowConnection {
  from: string;
  to: string;
  type: 'rule' | 'default' | 'end';
  ruleIndex?: number;
}

interface FlowArrowsProps {
  questions: Question[];
  containerRef: React.RefObject<HTMLDivElement>;
  hoveredQuestionId?: string | null;
}

export const FlowArrows = ({ questions, containerRef, hoveredQuestionId }: FlowArrowsProps) => {
  const [connections, setConnections] = useState<ArrowConnection[]>([]);
  const [arrowPaths, setArrowPaths] = useState<Map<string, string>>(new Map());
  const svgRef = useRef<SVGSVGElement>(null);

  // Calculate connections from logic rules
  useEffect(() => {
    const newConnections: ArrowConnection[] = [];

    questions.forEach((question, index) => {
      const logic = question.logic as QuestionLogic | undefined;

      if (logic?.rules) {
        // Add arrows for each rule
        logic.rules.forEach((rule, ruleIndex) => {
          if (rule.action.type === 'jump' && rule.action.target_question_id) {
            newConnections.push({
              from: question.id,
              to: rule.action.target_question_id,
              type: 'rule',
              ruleIndex,
            });
          } else if (rule.action.type === 'end') {
            newConnections.push({
              from: question.id,
              to: 'END',
              type: 'end',
              ruleIndex,
            });
          }
        });
      }

      // Add default next arrow if no custom default target
      if (!logic?.default_target && logic?.default_action === 'next') {
        const nextQuestion = questions[index + 1];
        if (nextQuestion) {
          newConnections.push({
            from: question.id,
            to: nextQuestion.id,
            type: 'default',
          });
        }
      } else if (logic?.default_target) {
        newConnections.push({
          from: question.id,
          to: logic.default_target,
          type: 'default',
        });
      } else if (logic?.default_action === 'end') {
        newConnections.push({
          from: question.id,
          to: 'END',
          type: 'end',
        });
      }
    });

    setConnections(newConnections);
  }, [questions]);

  // Calculate arrow paths
  useEffect(() => {
    if (!containerRef.current || connections.length === 0) {
      setArrowPaths(new Map());
      return;
    }

    const calculatePaths = () => {
      const container = containerRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const newPaths = new Map<string, string>();

      connections.forEach((connection, idx) => {
        const fromElement = container.querySelector(`[data-question-id="${connection.from}"]`);
        if (!fromElement) return;

        const fromRect = fromElement.getBoundingClientRect();

        let toRect: DOMRect | null = null;
        if (connection.to !== 'END') {
          const toElement = container.querySelector(`[data-question-id="${connection.to}"]`);
          if (!toElement) return;
          toRect = toElement.getBoundingClientRect();
        }

        // Calculate start point (right side of from card)
        const startX = fromRect.right - containerRect.left + 8;
        const startY = fromRect.top + fromRect.height / 2 - containerRect.top;

        let endX: number;
        let endY: number;

        if (connection.to === 'END') {
          // For end connections, draw arrow pointing down and right
          endX = startX + 60;
          endY = startY + 40;
        } else if (toRect) {
          // Calculate end point (right side of to card)
          endX = toRect.right - containerRect.left + 8;
          endY = toRect.top + toRect.height / 2 - containerRect.top;
        } else {
          return;
        }

        // Create curved path
        const path = createCurvedPath(startX, startY, endX, endY, connection.type);
        const key = `${connection.from}-${connection.to}-${connection.ruleIndex ?? 'default'}`;
        newPaths.set(key, path);
      });

      setArrowPaths(newPaths);
    };

    calculatePaths();

    // Recalculate on scroll or resize
    const handleUpdate = () => calculatePaths();
    const container = containerRef.current;
    container?.addEventListener('scroll', handleUpdate);
    window.addEventListener('resize', handleUpdate);

    // Use ResizeObserver to detect when cards change size
    const resizeObserver = new ResizeObserver(handleUpdate);
    const questionCards = container?.querySelectorAll('[data-question-id]');
    questionCards?.forEach((card) => resizeObserver.observe(card));

    return () => {
      container?.removeEventListener('scroll', handleUpdate);
      window.removeEventListener('resize', handleUpdate);
      resizeObserver.disconnect();
    };
  }, [connections, containerRef]);

  const createCurvedPath = (
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    type: 'rule' | 'default' | 'end'
  ): string => {
    // Calculate control points for smooth curve
    const deltaY = endY - startY;
    const deltaX = endX - startX;
    
    // For downward arrows, use a gentler curve
    if (deltaY > 0) {
      const controlX1 = startX + Math.min(40, Math.abs(deltaX) * 0.3);
      const controlY1 = startY;
      const controlX2 = endX - Math.min(40, Math.abs(deltaX) * 0.3);
      const controlY2 = endY;
      
      return `M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`;
    } else {
      // For upward arrows, create a wider curve to avoid overlap
      const curveOffset = 80;
      const controlX1 = startX + curveOffset;
      const controlY1 = startY;
      const controlX2 = endX + curveOffset;
      const controlY2 = endY;
      
      return `M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`;
    }
  };

  if (arrowPaths.size === 0) return null;

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ overflow: 'visible' }}
    >
      <defs>
        {/* Arrow markers */}
        <marker
          id="arrow-rule"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(var(--primary))" />
        </marker>
        <marker
          id="arrow-default"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(var(--muted-foreground))" opacity="0.4" />
        </marker>
        <marker
          id="arrow-end"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(var(--destructive))" />
        </marker>
      </defs>

      {Array.from(arrowPaths.entries()).map(([key, path]) => {
        const connection = connections.find(
          (c) =>
            key === `${c.from}-${c.to}-${c.ruleIndex ?? 'default'}`
        );
        if (!connection) return null;

        const isHighlighted =
          hoveredQuestionId === connection.from || hoveredQuestionId === connection.to;

        const strokeColor =
          connection.type === 'rule'
            ? 'hsl(var(--primary))'
            : connection.type === 'end'
            ? 'hsl(var(--destructive))'
            : 'hsl(var(--muted-foreground))';

        const opacity = connection.type === 'default' ? 0.3 : 0.6;
        const highlightedOpacity = connection.type === 'default' ? 0.5 : 0.9;

        return (
          <g key={key}>
            <path
              d={path}
              fill="none"
              stroke={strokeColor}
              strokeWidth={isHighlighted ? 2.5 : 1.5}
              strokeDasharray={connection.type === 'default' ? '4 4' : 'none'}
              opacity={isHighlighted ? highlightedOpacity : opacity}
              markerEnd={`url(#arrow-${connection.type})`}
              className="transition-all duration-200"
            />
            
            {/* Add a label for rule connections */}
            {connection.type === 'rule' && connection.ruleIndex !== undefined && (
              <text
                className="text-[10px] font-medium fill-primary"
                opacity={isHighlighted ? 0.9 : 0.6}
              >
                <textPath href={`#path-${key}`} startOffset="50%" textAnchor="middle">
                  Rule {connection.ruleIndex + 1}
                </textPath>
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};
