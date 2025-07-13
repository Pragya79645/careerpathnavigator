// components/InteractiveCareerGraph.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Network, ZoomIn, ZoomOut, RotateCcw, Info } from 'lucide-react';

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
  color: string;
  size: number;
  type: 'current' | 'intermediate' | 'target' | 'skill';
  description?: string;
  skills?: string[];
  timeline?: string;
}

interface Edge {
  from: string;
  to: string;
  label?: string;
  color?: string;
  strokeWidth?: number;
  animated?: boolean;
}

interface CareerGraphProps {
  currentSkills: string[];
  targetRole: string;
  timeline: string;
  selectedPath?: 'fastest' | 'inDemand' | 'balanced';
}

const InteractiveCareerGraph: React.FC<CareerGraphProps> = ({
  currentSkills,
  targetRole,
  timeline,
  selectedPath = 'balanced'
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  // Generate nodes and edges based on props
  const generateGraphData = () => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Current skills node
    nodes.push({
      id: 'current',
      label: 'Current Skills',
      x: 100,
      y: 300,
      color: '#3B82F6',
      size: 30,
      type: 'current',
      description: 'Your starting point',
      skills: currentSkills,
      timeline: 'Now'
    });

    // Path-specific intermediate nodes
    const pathConfigs = {
      fastest: {
        nodes: [
          { id: 'frontend', label: 'Frontend Dev', x: 250, y: 200, skills: ['HTML', 'CSS', 'JavaScript', 'React'] },
          { id: 'junior', label: 'Junior Role', x: 400, y: 250, skills: ['Git', 'Testing', 'Debugging'] }
        ],
        color: '#10B981',
        timeline: '3-6 months'
      },
      inDemand: {
        nodes: [
          { id: 'backend', label: 'Backend Dev', x: 250, y: 300, skills: ['Node.js', 'SQL', 'APIs'] },
          { id: 'devops', label: 'DevOps', x: 400, y: 200, skills: ['Docker', 'AWS', 'CI/CD'] },
          { id: 'cloud', label: 'Cloud Engineer', x: 550, y: 300, skills: ['Kubernetes', 'Terraform'] }
        ],
        color: '#F59E0B',
        timeline: '6-12 months'
      },
      balanced: {
        nodes: [
          { id: 'fullstack', label: 'Full Stack', x: 250, y: 300, skills: ['React', 'Node.js', 'MongoDB'] },
          { id: 'senior', label: 'Senior Dev', x: 400, y: 350, skills: ['Architecture', 'Leadership'] }
        ],
        color: '#8B5CF6',
        timeline: '8-15 months'
      }
    };

    const selectedConfig = pathConfigs[selectedPath];
    
    // Add intermediate nodes
    selectedConfig.nodes.forEach(node => {
      nodes.push({
        id: node.id,
        label: node.label,
        x: node.x,
        y: node.y,
        color: selectedConfig.color,
        size: 25,
        type: 'intermediate',
        description: `Intermediate step in ${selectedPath} path`,
        skills: node.skills,
        timeline: selectedConfig.timeline
      });
    });

    // Target role node
    nodes.push({
      id: 'target',
      label: targetRole,
      x: 650,
      y: 300,
      color: '#EF4444',
      size: 35,
      type: 'target',
      description: 'Your target role',
      timeline: timeline
    });

    // Generate edges
    const intermediateIds = selectedConfig.nodes.map(n => n.id);
    
    // Connect current to first intermediate nodes
    if (intermediateIds.length > 0) {
      edges.push({
        from: 'current',
        to: intermediateIds[0],
        label: 'Learn',
        color: selectedConfig.color,
        strokeWidth: 2,
        animated: true
      });
    }

    // Connect intermediate nodes
    for (let i = 0; i < intermediateIds.length - 1; i++) {
      edges.push({
        from: intermediateIds[i],
        to: intermediateIds[i + 1],
        label: 'Grow',
        color: selectedConfig.color,
        strokeWidth: 2
      });
    }

    // Connect to target
    const lastIntermediate = intermediateIds[intermediateIds.length - 1];
    if (lastIntermediate) {
      edges.push({
        from: lastIntermediate,
        to: 'target',
        label: 'Achieve',
        color: selectedConfig.color,
        strokeWidth: 3,
        animated: true
      });
    }

    return { nodes, edges };
  };

  const { nodes, edges } = generateGraphData();

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.3));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedNode(null);
  };

  const handleNodeClick = (node: Node) => {
    setSelectedNode(node);
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'current': return '🎯';
      case 'intermediate': return '🚀';
      case 'target': return '⭐';
      default: return '📊';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Network className="w-5 h-5 mr-2" />
          Interactive Career Path - {selectedPath.charAt(0).toUpperCase() + selectedPath.slice(1)} Route
        </h3>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleZoomIn}
            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden bg-gray-50 rounded-lg" style={{ height: '500px' }}>
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox="0 0 800 500"
          className="cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#6B7280" />
            </marker>
            
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {/* Render edges */}
            {edges.map((edge, index) => {
              const fromNode = nodes.find(n => n.id === edge.from);
              const toNode = nodes.find(n => n.id === edge.to);
              if (!fromNode || !toNode) return null;

              const midX = (fromNode.x + toNode.x) / 2;
              const midY = (fromNode.y + toNode.y) / 2;

              return (
                <g key={index}>
                  <line
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke={edge.color || '#6B7280'}
                    strokeWidth={edge.strokeWidth || 2}
                    markerEnd="url(#arrowhead)"
                    className={edge.animated ? 'animate-pulse' : ''}
                  />
                  {edge.label && (
                    <text
                      x={midX}
                      y={midY - 10}
                      textAnchor="middle"
                      className="text-xs fill-gray-600 font-medium"
                      style={{ textShadow: '1px 1px 2px rgba(255,255,255,0.8)' }}
                    >
                      {edge.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Render nodes */}
            {nodes.map((node, index) => (
              <g key={index}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.size}
                  fill={node.color}
                  className="hover:opacity-80 cursor-pointer transition-opacity"
                  onClick={() => handleNodeClick(node)}
                  filter={selectedNode?.id === node.id ? 'url(#glow)' : ''}
                  strokeWidth={selectedNode?.id === node.id ? 3 : 1}
                  stroke={selectedNode?.id === node.id ? '#1F2937' : '#FFFFFF'}
                />
                
                <text
                  x={node.x}
                  y={node.y + 5}
                  textAnchor="middle"
                  className="text-xs font-bold fill-white pointer-events-none"
                >
                  {getNodeIcon(node.type)}
                </text>
                
                <text
                  x={node.x}
                  y={node.y + node.size + 15}
                  textAnchor="middle"
                  className="text-sm font-medium fill-gray-700 pointer-events-none"
                >
                  {node.label}
                </text>
                
                {node.timeline && (
                  <text
                    x={node.x}
                    y={node.y + node.size + 30}
                    textAnchor="middle"
                    className="text-xs fill-gray-500 pointer-events-none"
                  >
                    {node.timeline}
                  </text>
                )}
              </g>
            ))}
          </g>
        </svg>
      </div>

      {/* Node details panel */}
      {selectedNode && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-blue-800 flex items-center">
              <Info className="w-4 h-4 mr-2" />
              {selectedNode.label}
            </h4>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-blue-600 hover:text-blue-800"
            >
              ×
            </button>
          </div>
          
          {selectedNode.description && (
            <p className="text-sm text-gray-700 mb-2">{selectedNode.description}</p>
          )}
          
          {selectedNode.skills && (
            <div>
              <span className="text-sm font-medium text-gray-700">Required Skills:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedNode.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {selectedNode.timeline && (
            <p className="text-sm text-gray-600 mt-2">
              <strong>Timeline:</strong> {selectedNode.timeline}
            </p>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center space-x-6 text-sm text-gray-600">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
          <span>Current Skills</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-purple-500 rounded-full mr-2"></div>
          <span>Learning Path</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
          <span>Target Role</span>
        </div>
      </div>
    </div>
  );
};

export default InteractiveCareerGraph;