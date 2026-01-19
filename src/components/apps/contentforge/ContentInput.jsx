import React, { useState } from 'react';
import { FileText, Link, Upload, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Button } from '../../ui/button';
import { Textarea } from '../../ui/textarea';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';

function ContentInput({ sourceType, setSourceType, onGenerate, isGenerating }) {
  const [textContent, setTextContent] = useState('');
  const [urlContent, setUrlContent] = useState('');
  const [fileName, setFileName] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result;
        // Pass the actual file content to be processed by AI
        onGenerate(content, file.name, 'file');
      };
      reader.readAsText(file);
    }
  };

  const showErrorToast = (message) => {
    // lightweight fallback toast; could be replaced with a proper toast lib
    window.alert(message || 'We could not generate content. Please try again.');
  };

  const handleGenerate = () => {
    let content = '';

    switch (sourceType) {
      case 'text':
        content = textContent;
        break;
      case 'url':
        // Pass the URL directly - the AI service will extract content
        content = urlContent;
        break;
      case 'youtube':
        // Pass the YouTube URL directly - the AI service will extract transcript
        content = youtubeUrl;
        break;
    }

    if (!content) {
      showErrorToast('Please enter some content first.');
      return;
    }

    onGenerate(content, fileName, sourceType)?.catch?.((err) => {
      showErrorToast(err?.message || 'Unable to generate content right now.');
    });
  };

  const canGenerate = () => {
    switch (sourceType) {
      case 'text':
        return textContent.trim().length > 0;
      case 'url':
        return urlContent.trim().length > 0;
      case 'youtube':
        return youtubeUrl.trim().length > 0;
      default:
        return false;
    }
  };

  const charCount = textContent.length;
  const maxChars = 5000;

  return (
    <div className="space-y-5">
      <Tabs value={sourceType} onValueChange={setSourceType}>
        <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-xl">
          <TabsTrigger
            value="text"
            className="flex items-center gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Text</span>
          </TabsTrigger>
          <TabsTrigger
            value="url"
            className="flex items-center gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg"
          >
            <Link className="h-4 w-4" />
            <span className="hidden sm:inline">URL</span>
          </TabsTrigger>
          <TabsTrigger
            value="file"
            className="flex items-center gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg"
          >
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">File</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="space-y-4 mt-5">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="text-input">Paste your content</Label>
              <span
                className={`text-xs ${charCount > maxChars ? 'text-red-500' : 'text-gray-500'}`}
              >
                {charCount} / {maxChars}
              </span>
            </div>
            <Textarea
              id="text-input"
              placeholder="Paste your blog post, article, or any long-form content here...

The more detailed your content, the better the results!"
              className="min-h-[280px] resize-none focus:ring-2 focus:ring-blue-500/20"
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              maxLength={maxChars}
            />
          </motion.div>
        </TabsContent>

        <TabsContent value="url" className="space-y-4 mt-5">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Label htmlFor="url-input" className="flex items-center gap-2 mb-2">
              <Link className="h-4 w-4 text-blue-600" />
              Article URL
            </Label>
            <Input
              id="url-input"
              type="url"
              placeholder="https://example.com/article"
              className="h-12"
              value={urlContent}
              onChange={(e) => setUrlContent(e.target.value)}
            />
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mt-3">
              <p className="text-sm text-blue-700">
                Enter the URL of a blog post or article to extract and transform
              </p>
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="file" className="space-y-4 mt-5">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Label htmlFor="file-input" className="flex items-center gap-2 mb-2">
              <Upload className="h-4 w-4 text-purple-600" />
              Upload File
            </Label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group">
              <Upload className="h-14 w-14 mx-auto text-gray-400 mb-4 group-hover:text-blue-500 transition-colors" />
              <Input
                id="file-input"
                type="file"
                accept=".pdf,.txt,.doc,.docx"
                className="hidden"
                onChange={handleFileUpload}
              />
              <label htmlFor="file-input" className="cursor-pointer">
                <Button variant="outline" className="mb-3" asChild>
                  <span>Choose File</span>
                </Button>
                <p className="text-sm text-gray-500">or drag and drop</p>
                <p className="text-xs text-gray-400 mt-2">PDF, TXT, DOC, DOCX (Max 10MB)</p>
              </label>
              {fileName && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg"
                >
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">{fileName}</span>
                </motion.div>
              )}
            </div>
          </motion.div>
        </TabsContent>

      </Tabs>

      {sourceType !== 'file' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Button
            onClick={handleGenerate}
            disabled={!canGenerate() || isGenerating}
            className="w-full contentforge-primary-btn h-12"
            size="lg"
          >
            {isGenerating ? (
              <>
                <div className="contentforge-spinner mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Posts
              </>
            )}
          </Button>
        </motion.div>
      )}
    </div>
  );
}

export default ContentInput;
