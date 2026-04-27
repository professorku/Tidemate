import BoatPreviewCard from '../../../components/ui/BoatPreviewCard'

export default function ProfileBoatCard({ boat }) {
  return (
    <BoatPreviewCard
      boat={boat}
      className="rounded-[28px] hover:-translate-y-1 hover:shadow-lg"
      imageClassName="h-56"
      metaAsPills
      priceSuffix=" / day"
    />
  )
}
