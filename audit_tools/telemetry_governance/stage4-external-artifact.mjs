import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {hashCapability} from '../../server/anonymous-telemetry-poc/capabilities.mjs';
export const externalURL='https://wjbyrd.github.io/test/';
export const stagingOrigin='https://stage3.masteryquests.org';
export async function readExternalArtifact(){
  const response=await fetch(externalURL,{redirect:'error',cache:'no-store'});
  assert.equal(response.status,200);
  const bytes=Buffer.from(await response.arrayBuffer()),html=bytes.toString();
  const match=html.match(/globalThis.MQ_INGEST_ACTIVATION = ([^]*?);<\/script>/);
  assert(match,'Hosted artifact has no activation descriptor');
  const descriptor=JSON.parse(match[1]);
  assert.equal(descriptor.endpoint,stagingOrigin+'/v1/events');
  return {html,descriptor,artifactSha256:createHash('sha256').update(bytes).digest('hex'),capabilityHash:await hashCapability(descriptor.capability)};
}
