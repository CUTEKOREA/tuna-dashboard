import { unloadingHistoryPublicResponse } from '@/lib/data/unloading-history';
import {
  UnloadingHistoryPublicResponseSchema,
  type UnloadingHistoryPublicResponse,
} from './schema';

export function getUnloadingHistoryResponse(): UnloadingHistoryPublicResponse {
  return UnloadingHistoryPublicResponseSchema.parse(unloadingHistoryPublicResponse);
}
