// The corrected function in ArticleForm.tsx
const handleAiFeature = async (feature: 'title' | 'summary') => {
    if (!content) return;
    setIsGenerating(true);
    const endpoint = feature === 'title' ? "/api/admin/ai/generate-title" : "/api/admin/ai/generate-summary";
    try {
      // Corrected call to apiRequest
      const response = await apiRequest("POST", endpoint, { content });
      const data = await response.json(); // Correctly parse the JSON
      
      if (feature === 'title') {
        setTitle(data.title);
      } else {
        setExcerpt(data.summary);
      }
      toast({ title: "Success", description: `AI ${feature} generated successfully!` });
    } catch (error) {
      toast({ title: "Error", description: `Failed to generate ${feature}.`, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };