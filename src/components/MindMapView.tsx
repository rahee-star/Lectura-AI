import React, { useState } from 'react';
import { Network, Sparkles, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { MindMapNode } from '../types';

interface MindMapViewProps {
  nodes: MindMapNode[];
  onSelectConcept?: (concept: string) => void;
}

export const MindMapView: React.FC<MindMapViewProps> = ({ nodes, onSelectConcept }) => {
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

  const rootNode = nodes.find((n) => !n.parentId) || nodes[0];
  const childNodes = (parentId: string) => nodes.filter((n) => n.parentId === parentId);

  return (
    <div className="relative p-6 bg-[#1E293B] border border-slate-700 rounded-3xl space-y-6 shadow-2xl overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 rounded-xl shadow-sm">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100">Hierarchical Concept & Case Mind Map</h3>
            <p className="text-xs text-slate-400">Visual breakdown of lecture ideas and doctrinal dependencies</p>
          </div>
        </div>

        <span className="text-xs text-indigo-300 font-mono font-bold bg-slate-900 px-3 py-1 rounded-xl border border-slate-700">
          {nodes.length} Connected Nodes
        </span>
      </div>

      {/* Visual Tree */}
      <div className="p-6 bg-slate-900/90 border border-slate-700/80 rounded-2xl overflow-x-auto shadow-inner">
        <div className="flex flex-col items-center space-y-8 min-w-[650px] py-4">
          {/* Root */}
          {rootNode && (
            <div
              onClick={() => {
                setActiveNodeId(rootNode.id);
                if (onSelectConcept) onSelectConcept(rootNode.label);
              }}
              className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm rounded-2xl shadow-xl shadow-indigo-500/20 border border-indigo-400/30 cursor-pointer hover:scale-105 transition-all text-center"
            >
              {rootNode.label}
            </div>
          )}

          {/* Level 1 Children */}
          {rootNode && (
            <div className="grid grid-cols-3 gap-6 w-full">
              {childNodes(rootNode.id).map((cNode) => (
                <div key={cNode.id} className="flex flex-col items-center space-y-4">
                  {/* Connector line */}
                  <div className="w-0.5 h-6 bg-indigo-500/40" />

                  {/* Level 1 Node */}
                  <div
                    onClick={() => {
                      setActiveNodeId(cNode.id);
                      if (onSelectConcept) onSelectConcept(cNode.label);
                    }}
                    className={`w-full p-4 rounded-2xl border text-center transition-all cursor-pointer shadow-md ${
                      activeNodeId === cNode.id
                        ? 'bg-indigo-950/80 border-indigo-500 text-white'
                        : 'bg-slate-900 border-slate-700 text-slate-200 hover:border-slate-600'
                    }`}
                  >
                    <span className="text-[10px] text-indigo-400 font-bold block uppercase tracking-wider mb-1">
                      {cNode.category || 'Module'}
                    </span>
                    <h5 className="font-bold text-xs">{cNode.label}</h5>
                  </div>

                  {/* Level 2 Sub-nodes */}
                  <div className="space-y-2 w-full">
                    {childNodes(cNode.id).map((subNode) => (
                      <div
                        key={subNode.id}
                        onClick={() => {
                          setActiveNodeId(subNode.id);
                          if (onSelectConcept) onSelectConcept(subNode.label);
                        }}
                        className="p-3 bg-slate-950/70 hover:bg-slate-900 border border-slate-700/60 rounded-xl text-left text-xs transition-all cursor-pointer group shadow-sm"
                      >
                        <span className="text-[10px] text-emerald-400 font-bold block">
                          {subNode.category || 'Concept'}
                        </span>
                        <span className="text-slate-300 font-medium group-hover:text-white">
                          {subNode.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
