export interface Service {
  id: string
  name: string
  description: string
  price: number // in cents
  image: string
  category: string
  deliveryTime: string
}

let services: Service[] = [
  {
    id: '1',
    name: 'Web Design',
    description: 'Professional, modern website design tailored to your brand. Includes responsive layouts, custom graphics, and up to 5 pages. Delivered as high-fidelity Figma mockups ready for development.',
    price: 49900,
    image: 'https://picsum.photos/seed/webdesign/600/400',
    category: 'Web Design',
    deliveryTime: '7 days',
  },
  {
    id: '2',
    name: 'SEO Audit',
    description: 'Comprehensive SEO audit covering on-page optimization, backlink profile, technical SEO, and competitor analysis. Includes a detailed report with actionable recommendations to boost your search rankings.',
    price: 19900,
    image: 'https://picsum.photos/seed/seoaudit/600/400',
    category: 'SEO',
    deliveryTime: '3 days',
  },
  {
    id: '3',
    name: 'Logo Design',
    description: 'Custom logo design that captures your brand identity. Includes 3 initial concepts, 2 rounds of revisions, and final delivery in SVG, PNG, and PDF formats. Brand guidelines document included.',
    price: 14900,
    image: 'https://picsum.photos/seed/logodesign/600/400',
    category: 'Branding',
    deliveryTime: '5 days',
  },
  {
    id: '4',
    name: 'Social Media Package',
    description: 'Complete social media content package including 30 custom-designed posts, captions, hashtag strategy, and a content calendar. Covers Instagram, Facebook, and LinkedIn formats.',
    price: 29900,
    image: 'https://picsum.photos/seed/socialmedia/600/400',
    category: 'Marketing',
    deliveryTime: '10 days',
  },
  {
    id: '5',
    name: 'Landing Page',
    description: 'High-converting landing page designed and developed to maximize your campaign ROI. Includes copywriting, responsive design, A/B test variants, and integration with your email marketing tool.',
    price: 34900,
    image: 'https://picsum.photos/seed/landingpage/600/400',
    category: 'Web Design',
    deliveryTime: '5 days',
  },
  {
    id: '6',
    name: 'Consulting Call',
    description: '60-minute one-on-one consulting session with an expert. Choose your focus: business strategy, marketing, tech stack, or product development. Includes a follow-up summary with key action items.',
    price: 9900,
    image: 'https://picsum.photos/seed/consulting/600/400',
    category: 'Consulting',
    deliveryTime: '1 day',
  },
]

export function getAllServices(): Service[] {
  return services
}

export function getServiceById(id: string): Service | undefined {
  return services.find((s) => s.id === id)
}

export function addService(service: Omit<Service, 'id'>): Service {
  const newService: Service = {
    ...service,
    id: String(Date.now()),
  }
  services = [...services, newService]
  return newService
}

export function deleteService(id: string): boolean {
  const before = services.length
  services = services.filter((s) => s.id !== id)
  return services.length < before
}
