import worker from '../../server/anonymous-telemetry-poc/worker.mjs';
import {pausedWorker} from './stage5-pause-worker.mjs';
export default pausedWorker(worker);
