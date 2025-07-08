import { articles, type Article, type InsertArticle, type UpdateArticle } from "@shared/schema";

export interface IStorage {
  // Articles
  getArticles(): Promise<Article[]>;
  getArticleById(id: number): Promise<Article | undefined>;
  getArticleBySlug(slug: string): Promise<Article | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: number, article: UpdateArticle): Promise<Article | undefined>;
  deleteArticle(id: number): Promise<boolean>;
  getPublishedArticles(): Promise<Article[]>;
}

export class MemStorage implements IStorage {
  private articles: Map<number, Article>;
  private currentId: number;

  constructor() {
    this.articles = new Map();
    this.currentId = 1;
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Add some sample articles for testing
    const sampleArticles = [
      {
        title: "Breaking: New AI Technology Revolutionizes Healthcare",
        slug: "ai-technology-revolutionizes-healthcare",
        content: "In a groundbreaking development, researchers at leading medical institutions have unveiled a new artificial intelligence system that can diagnose diseases with unprecedented accuracy. The AI-powered diagnostic tool has shown remarkable results in clinical trials, achieving a 95% accuracy rate in detecting early-stage cancers.\n\nThe technology works by analyzing medical images, lab results, and patient history to identify patterns that might be missed by human physicians. This breakthrough could transform how we approach medical diagnosis and treatment.\n\nDr. Sarah Johnson, lead researcher on the project, stated: 'This AI system represents a paradigm shift in medical diagnosis. It's not meant to replace doctors, but to enhance their capabilities and help them make more informed decisions.'\n\nThe system has been tested across multiple medical centers and has shown consistent results across different populations and medical conditions. Plans are underway to implement this technology in hospitals nationwide within the next two years.",
        excerpt: "Researchers unveil AI system that diagnoses diseases with 95% accuracy, potentially transforming medical diagnosis and treatment.",
        imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        author: "Sarah Chen",
        published: true,
      },
      {
        title: "Climate Change Summit: World Leaders Agree on Ambitious New Goals",
        slug: "climate-change-summit-world-leaders-new-goals",
        content: "World leaders from over 190 countries gathered in Geneva for the Global Climate Action Summit, reaching unprecedented agreements on carbon emission reductions and renewable energy targets. The summit concluded with the signing of the Geneva Climate Accord, which sets ambitious goals for the next decade.\n\nKey highlights from the summit include:\n\n• A commitment to achieve net-zero emissions by 2035\n• $500 billion in funding for renewable energy projects in developing countries\n• Mandatory carbon pricing mechanisms in all participating nations\n• Protection of 40% of global land and ocean areas by 2030\n\nEnvironmental groups have praised the agreement as 'the most significant climate action in a generation,' while some critics argue that the timeline may be too aggressive for practical implementation.\n\nThe accord will be formally ratified by member nations over the coming months, with implementation beginning in January 2025.",
        excerpt: "190+ countries sign Geneva Climate Accord with ambitious net-zero goals and $500B funding for renewable energy.",
        imageUrl: "https://images.unsplash.com/photo-1569163139394-de4e5f43e4e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        author: "Mark Rodriguez",
        published: true,
      },
      {
        title: "Space Exploration: Private Company Successfully Lands on Mars",
        slug: "private-company-successfully-lands-mars",
        content: "SpaceVenture Corp made history yesterday by becoming the first private company to successfully land a spacecraft on Mars. The unmanned mission, dubbed 'Red Pioneer,' touched down in the Chryse Planitia region after a six-month journey from Earth.\n\nThe spacecraft is equipped with advanced geological instruments and will conduct soil analysis over the next two years. Initial data transmission has been successful, with the first high-resolution images of the Martian surface already received by mission control.\n\n'This represents a new era in space exploration,' said CEO Jennifer Walsh. 'By making space missions more cost-effective and accessible, we're opening up possibilities that were previously limited to government space agencies.'\n\nThe mission cost approximately $2.8 billion, significantly less than traditional government-led Mars missions. The success has sparked interest from other private companies and investors looking to enter the space exploration market.\n\nThe next phase of the mission will focus on searching for signs of ancient microbial life and testing equipment for future human missions to Mars.",
        excerpt: "SpaceVenture Corp becomes first private company to land on Mars, opening new era in space exploration.",
        imageUrl: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        author: "Alex Thompson",
        published: true,
      },
      {
        title: "Tech Giant Announces Revolutionary Quantum Computing Breakthrough",
        slug: "tech-giant-quantum-computing-breakthrough",
        content: "TechCorp unveiled its latest quantum computing system, claiming to have achieved 'quantum supremacy' with a 1000-qubit processor. The announcement came during the company's annual technology conference, where engineers demonstrated the system solving complex mathematical problems in seconds that would take traditional computers years to complete.\n\nThe quantum computer, named 'QuantumOne,' uses a novel approach to error correction that significantly reduces the noise and instability issues that have plagued previous quantum systems. This breakthrough could have far-reaching implications for fields such as drug discovery, financial modeling, and artificial intelligence.\n\nIndustry experts are calling this development a 'game-changer' for quantum computing, though some remain skeptical about the practical applications in the near term. The company plans to make the quantum computing power available to researchers and enterprises through a cloud-based platform starting next year.\n\nThe announcement has already impacted stock markets, with TechCorp's shares rising 15% in after-hours trading.",
        excerpt: "TechCorp achieves quantum supremacy with 1000-qubit processor, promising revolutionary advances in computing.",
        imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        author: "David Kim",
        published: true,
      },
      {
        title: "Global Economy Shows Strong Recovery Signs After Challenging Year",
        slug: "global-economy-strong-recovery-signs",
        content: "Economic indicators from major world economies are showing promising signs of recovery, with GDP growth exceeding expectations in the third quarter. The International Monetary Fund (IMF) has revised its global growth projections upward, now predicting 3.2% growth for the year.\n\nKey factors driving the recovery include:\n\n• Increased consumer spending as confidence returns\n• Strong performance in the technology and healthcare sectors\n• Successful implementation of fiscal stimulus measures\n• Improved supply chain efficiency and reduced inflation\n\nUnemployment rates have also improved significantly, with the United States reporting a 3.8% unemployment rate, the lowest in over a decade. Similar trends are being observed in Europe and Asia.\n\nHowever, economists warn that challenges remain, including geopolitical tensions and the need for continued investment in infrastructure and education. The recovery's sustainability will depend on maintaining current momentum while addressing these underlying issues.\n\nFinancial markets have responded positively to the news, with major stock indices reaching new highs this week.",
        excerpt: "IMF raises global growth projections to 3.2% as unemployment hits decade lows and consumer confidence rebounds.",
        imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        author: "Emily Foster",
        published: true,
      }
    ];

    sampleArticles.forEach(articleData => {
      const id = this.currentId++;
      const now = new Date();
      const article: Article = {
        ...articleData,
        id,
        excerpt: articleData.excerpt || null,
        imageUrl: articleData.imageUrl || null,
        author: articleData.author || null,
        published: articleData.published ?? null,
        createdAt: now,
        updatedAt: now,
      };
      this.articles.set(id, article);
    });
  }

  async getArticles(): Promise<Article[]> {
    return Array.from(this.articles.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getArticleById(id: number): Promise<Article | undefined> {
    return this.articles.get(id);
  }

  async getArticleBySlug(slug: string): Promise<Article | undefined> {
    return Array.from(this.articles.values()).find(
      (article) => article.slug === slug
    );
  }

  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const id = this.currentId++;
    const now = new Date();
    const article: Article = {
      ...insertArticle,
      id,
      excerpt: insertArticle.excerpt || null,
      imageUrl: insertArticle.imageUrl || null,
      author: insertArticle.author || null,
      published: insertArticle.published ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.articles.set(id, article);
    return article;
  }

  async updateArticle(id: number, updateArticle: UpdateArticle): Promise<Article | undefined> {
    const existing = this.articles.get(id);
    if (!existing) return undefined;

    const updated: Article = {
      ...existing,
      ...updateArticle,
      updatedAt: new Date(),
    };
    this.articles.set(id, updated);
    return updated;
  }

  async deleteArticle(id: number): Promise<boolean> {
    return this.articles.delete(id);
  }

  async getPublishedArticles(): Promise<Article[]> {
    return Array.from(this.articles.values())
      .filter(article => article.published)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }
}

export const storage = new MemStorage();
