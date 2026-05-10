import ApiTable from '../components/ApiTable'
import BulletList from '../components/BulletList'
import RealtimeTable from '../components/RealtimeTable'
import Section from '../components/Section'
import { apiGroups } from '../data/apiDocs'

export default function ApiTab() {
  return (
    <>
      <Section title="How to read the API table">
        <BulletList
          items={[
            'Method shows the HTTP action used by the route.',
            'Route shows the backend path called by the frontend.',
            'Purpose describes what the route is used for in the app.',
            'Access shows who the route is meant for.',
          ]}
        />
      </Section>

      {apiGroups.map((group) => (
        <ApiTable key={group.title} group={group} />
      ))}

      <RealtimeTable />
    </>
  )
}
