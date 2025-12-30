import React, { useState } from 'react';
import { Copy, Download, Check, Linkedin, Twitter, Layout, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import CarouselPreview from './CarouselPreview';

function GeneratedContent({ outputs, isGenerating, progress = '' }) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleCopy = (content, index) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDownload = (content, format) => {
    const text = Array.isArray(content) ? content.join('\n\n---\n\n') : content;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${format}-post-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getFormatIcon = (format) => {
    switch (format) {
      case 'linkedin':
        return <Linkedin className="h-4 w-4" />;
      case 'twitter':
        return <Twitter className="h-4 w-4" />;
      case 'carousel':
        return <Layout className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getFormatLabel = (format) => {
    switch (format) {
      case 'linkedin':
        return 'LinkedIn';
      case 'twitter':
        return 'Twitter';
      case 'carousel':
        return 'Carousel';
      default:
        return format;
    }
  };

  if (isGenerating) {
    return (
      <Card className="p-8 lg:p-10 bg-white rounded-2xl shadow-lg border border-gray-100">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center space-y-6"
        >
          <div className="flex justify-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-blue-600 animate-pulse" />
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-gray-900 font-semibold mb-2">Generating your posts...</h3>
            <p className="text-gray-500">
              {progress || 'Our AI is crafting engaging content for you'}
            </p>
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.2 }}
                className="h-3 bg-gray-100 rounded-full overflow-hidden"
              >
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Card>
    );
  }

  if (outputs.length === 0) {
    return (
      <Card className="p-8 lg:p-12 bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg border border-gray-100">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center shadow-lg">
            <Layout className="h-10 w-10 text-blue-600" />
          </div>
          <div>
            <h3 className="text-gray-900 font-semibold mb-2">Ready to transform your content</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              Select your content source and output formats, then click "Generate Posts" to get
              started.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center pt-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm">
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 text-sky-700 rounded-lg text-sm">
              <Twitter className="h-4 w-4" />
              Twitter
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm">
              <Layout className="h-4 w-4" />
              Carousel
            </span>
          </div>
        </motion.div>
      </Card>
    );
  }

  if (outputs.length === 1) {
    const output = outputs[0];
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="p-6 lg:p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-2">
              {getFormatIcon(output.format)}
              <h3 className="text-gray-900 font-semibold">{getFormatLabel(output.format)} Post</h3>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleCopy(
                    Array.isArray(output.content) ? output.content.join('\n\n') : output.content,
                    output.format
                  )
                }
                className="hover:bg-blue-50 hover:border-blue-300"
              >
                {copiedIndex === output.format ? (
                  <>
                    <Check className="h-4 w-4 mr-1 text-green-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(output.content, output.format)}
                className="hover:bg-purple-50 hover:border-purple-300"
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
          </div>

          {output.format === 'carousel' && Array.isArray(output.content) ? (
            <CarouselPreview slides={output.content} />
          ) : output.format === 'twitter' && Array.isArray(output.content) ? (
            <div className="space-y-3">
              {output.content.map((tweet, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-sky-100 text-sky-700 rounded-md text-xs">
                      <Twitter className="h-3 w-3" />
                      Tweet {index + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(tweet, `${output.format}-${index}`)}
                      className="h-8 w-8 p-0"
                    >
                      {copiedIndex === `${output.format}-${index}` ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="whitespace-pre-wrap text-gray-700">{tweet}</p>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gradient-to-br from-blue-50 to-purple-50 p-5 rounded-xl border border-blue-100"
            >
              <p className="whitespace-pre-wrap text-gray-800">{output.content}</p>
            </motion.div>
          )}
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="p-6 lg:p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
        <h3 className="text-gray-900 font-semibold mb-5">Generated Posts</h3>
        <Tabs defaultValue={outputs[0].format}>
          <TabsList
            className="grid w-full bg-gray-100 p-1"
            style={{ gridTemplateColumns: `repeat(${outputs.length}, 1fr)` }}
          >
            {outputs.map((output) => (
              <TabsTrigger
                key={output.format}
                value={output.format}
                className="flex items-center gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                {getFormatIcon(output.format)}
                <span className="hidden sm:inline">{getFormatLabel(output.format)}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <AnimatePresence mode="wait">
            {outputs.map((output) => (
              <TabsContent key={output.format} value={output.format} className="space-y-4 mt-5">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex justify-end gap-2 mb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleCopy(
                          Array.isArray(output.content)
                            ? output.content.join('\n\n')
                            : output.content,
                          output.format
                        )
                      }
                      className="hover:bg-blue-50 hover:border-blue-300"
                    >
                      {copiedIndex === output.format ? (
                        <>
                          <Check className="h-4 w-4 mr-1 text-green-600" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(output.content, output.format)}
                      className="hover:bg-purple-50 hover:border-purple-300"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>

                  {output.format === 'carousel' && Array.isArray(output.content) ? (
                    <CarouselPreview slides={output.content} />
                  ) : output.format === 'twitter' && Array.isArray(output.content) ? (
                    <div className="space-y-3">
                      {output.content.map((tweet, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-sky-100 text-sky-700 rounded-md text-xs">
                              <Twitter className="h-3 w-3" />
                              Tweet {index + 1}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopy(tweet, `${output.format}-${index}`)}
                              className="h-8 w-8 p-0"
                            >
                              {copiedIndex === `${output.format}-${index}` ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <p className="whitespace-pre-wrap text-gray-700">{tweet}</p>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-5 rounded-xl border border-blue-100">
                      <p className="whitespace-pre-wrap text-gray-800">{output.content}</p>
                    </div>
                  )}
                </motion.div>
              </TabsContent>
            ))}
          </AnimatePresence>
        </Tabs>
      </Card>
    </motion.div>
  );
}

export default GeneratedContent;
