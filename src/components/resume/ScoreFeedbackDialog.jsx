import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { TrendingUp, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ScoreFeedbackDialog({ open, onClose, score, feedback }) {
  if (!feedback) return null;

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            Resume Score & Feedback
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Score Display */}
          <Card className={`p-6 border-2 ${getScoreBgColor(score)}`}>
            <div className="text-center">
              <div className={`text-6xl font-bold ${getScoreColor(score)} mb-2`}>
                {score}%
              </div>
              <p className="text-gray-700 text-lg">
                {score >= 90 ? 'Excellent!' : score >= 75 ? 'Good job!' : score >= 60 ? 'Getting there!' : 'Needs improvement'}
              </p>
            </div>
          </Card>

          {/* Summary */}
          {feedback.summary && (
            <Card className="p-4 bg-blue-50 border-blue-200">
              <p className="text-gray-800 leading-relaxed">{feedback.summary}</p>
            </Card>
          )}

          {/* Strengths */}
          {feedback.strengths && feedback.strengths.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                What's Working Well
              </h3>
              <div className="space-y-2">
                {feedback.strengths.map((strength, idx) => (
                  <Card key={idx} className="p-3 bg-green-50 border-green-200">
                    <div className="flex gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-800">{strength}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Improvements */}
          {feedback.improvements && feedback.improvements.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                Areas to Improve
              </h3>
              <div className="space-y-2">
                {feedback.improvements.map((improvement, idx) => (
                  <Card key={idx} className="p-3 bg-orange-50 border-orange-200">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-800">{improvement}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Call to Action */}
          <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="w-6 h-6 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Need Help Improving?</h3>
            </div>
            <p className="text-gray-700 mb-4">
              Use the AI Writer button in each section to get professional suggestions and improve your content.
            </p>
            <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={onClose}>
              Continue Editing
            </Button>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}