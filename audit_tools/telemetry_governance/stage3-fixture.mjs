// Ephemeral local fixtures only; callers must never persist returned credentials.
import {generateCapability,INGEST_ENDPOINT} from '../../server/anonymous-telemetry-poc/capabilities.mjs';
export function activationResponse(scope){const issued=Date.now();return {ok:true,activationVersion:'mq-build-activation/1',capability:generateCapability(),capabilityId:crypto.randomUUID(),endpoint:INGEST_ENDPOINT,...scope,issuedAt:new Date(issued).toISOString(),expiresAt:new Date(issued+365*86400000).toISOString(),governanceVersion:'mq-governance/2'};}
export function descriptor(response){const {ok,governanceVersion,...value}=response;return value;}
