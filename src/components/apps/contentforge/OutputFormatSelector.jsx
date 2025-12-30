import React from 'react';
import { Linkedin, Twitter, Layout } from 'lucide-react';
import { motion } from 'framer-motion';

const formats = [
  {
    id: 'linkedin',
    label: 'LinkedIn Post',
    icon: Linkedin,
    description: 'Professional post with key insights',
    color: 'text-blue-600',
    bgGradient: 'from-blue-500 to-blue-600',
  },
  {
    id: 'twitter',
    label: 'Twitter Thread',
    icon: Twitter,
    description: 'Multi-tweet thread format',
    color: 'text-sky-500',
    bgGradient: 'from-sky-500 to-sky-600',
  },
  {
    id: 'carousel',
    label: 'Carousel Slides',
    icon: Layout,
    description: 'Instagram/LinkedIn carousel',
    color: 'text-purple-600',
    bgGradient: 'from-purple-500 to-purple-600',
  },
];

function OutputFormatSelector({ selectedFormats, setSelectedFormats }) {
  const toggleFormat = (formatId) => {
    if (selectedFormats.includes(formatId)) {
      setSelectedFormats(selectedFormats.filter((f) => f !== formatId));
    } else {
      setSelectedFormats([...selectedFormats, formatId]);
    }
  };

  return (
    <div className="space-y-3">
      {formats.map((format, index) => {
        const isSelected = selectedFormats.includes(format.id);
        const Icon = format.icon;

        return (
          <motion.button
            key={format.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            onClick={() => toggleFormat(format.id)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
              isSelected
                ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-500/20'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`shrink-0 h-12 w-12 rounded-lg bg-gradient-to-br ${format.bgGradient} flex items-center justify-center text-white shadow-lg`}
              >
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4
                    className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}
                  >
                    {format.label}
                  </h4>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center"
                    >
                      <svg
                        className="h-3 w-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </motion.div>
                  )}
                </div>
                <p className={`text-sm ${isSelected ? 'text-blue-700' : 'text-gray-500'}`}>
                  {format.description}
                </p>
              </div>
            </div>
          </motion.button>
        );
      })}

      {selectedFormats.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3"
        >
          <svg
            className="h-5 w-5 text-amber-600 shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div>
            <p className="text-sm text-amber-800">
              Please select at least one output format to continue
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default OutputFormatSelector;
