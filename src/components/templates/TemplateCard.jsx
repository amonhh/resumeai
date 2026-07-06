import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function TemplateCard({ template, selected, onSelect }) {
  return (
    <Card 
      className={`relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl group ${
        selected ? 'ring-2 ring-blue-600 shadow-xl' : 'hover:shadow-lg'
      }`}
      onClick={onSelect}
    >
      {selected && (
        <div className="absolute top-3 right-3 z-10 bg-blue-600 rounded-full p-1">
          <CheckCircle2 className="w-5 h-5 text-white" />
        </div>
      )}
      
      <div className="relative h-96 bg-white overflow-hidden">
        <img 
          src={template.preview} 
          alt={template.name}
          className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      
      <div className="p-4 bg-white border-t">
        <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
        <p className="text-sm text-gray-600">{template.description}</p>
      </div>
    </Card>
  );
}