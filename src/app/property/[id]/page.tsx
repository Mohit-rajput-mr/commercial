import { notFound } from 'next/navigation';
import { allProperties } from '@/data/sampleProperties';
import PropertyDetail from '@/components/PropertyDetail';

export async function generateStaticParams() {
  return allProperties.map((property) => ({
    id: property.id,
  }));
}

export default function PropertyPage({ params }: { params: { id: string } }) {
  const property = allProperties.find((p) => p.id === params.id);

  if (!property) {
    notFound();
  }

  return <PropertyDetail property={property} />;
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const property = allProperties.find((p) => p.id === params.id);

  if (!property) {
    return {
      title: 'Property Not Found',
    };
  }

  return {
    title: `${property.address} - ${property.type} Space for ${property.price} | Commercial RE`,
    description: property.description,
  };
}

