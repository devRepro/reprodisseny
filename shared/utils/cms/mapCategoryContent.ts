type CategoryContentModel = {
    sections: CmsMappedSection[];
    tabs: Array<{
      id: string;
      title: string;
      blocks: CmsContentBlock[];
      text?: string;
      step?: number;
    }>;
  };