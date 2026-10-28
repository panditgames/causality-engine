import React, { useMemo, useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { EventRecord } from '../engine/types';

interface CausalGraphProps {
  events: EventRecord[];
}

export const CausalGraph: React.FC<CausalGraphProps> = ({ events }) => {
  // We need to construct a graph from the linear event log
  // Events have 'causes' which are IDs of previous events

  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Simple vertical layout for now based on tick time
    const tickLevels: Record<number, number> = {};

    events.forEach((event) => {
      if (tickLevels[event.tick] === undefined) {
        tickLevels[event.tick] = 0;
      }

      const xPos = 250 * tickLevels[event.tick];
      const yPos = event.tick * 100;

      tickLevels[event.tick]++;

      // Determine node color based on event type
      let borderColor = '#aa3bff'; // Default purple
      if (event.type.includes('CLOSED') || event.type.includes('LOST') || event.type === 'POWER_OUTAGE') {
        borderColor = '#ef4444'; // Red for negative
      }

      nodes.push({
        id: event.id,
        position: { x: xPos, y: yPos },
        data: {
          label: (
            <div className="flex flex-col text-xs">
              <span className="font-bold border-b border-gray-600 pb-1 mb-1">{event.type}</span>
              <span>{event.description}</span>
              <span className="text-gray-500 mt-1 text-[10px]">TICK {event.tick}</span>
            </div>
          )
        },
        style: {
          background: 'rgba(15, 15, 20, 0.9)',
          color: 'white',
          border: `1px solid ${borderColor}`,
          borderRadius: '4px',
          width: 200,
          boxShadow: `0 0 10px ${borderColor}40`
        }
      });

      event.causes.forEach(causeId => {
        edges.push({
          id: `e-${causeId}-${event.id}`,
          source: causeId,
          target: event.id,
          animated: true,
          style: { stroke: '#0ff', strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#0ff',
          },
        });
      });
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [events]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update when events change
  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  return (
    <div className="w-full h-full glass-panel overflow-hidden relative">
      {events.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
          No causal events recorded yet.
        </div>
      ) : (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          attributionPosition="bottom-right"
        >
          <Background color="#333" gap={16} />
          <Controls className="bg-[var(--color-panel-glass)] fill-white" />
        </ReactFlow>
      )}
    </div>
  );
};
