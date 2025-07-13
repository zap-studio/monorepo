import "server-only";

import { authMiddleware, base } from "@/rpc/middlewares";
import { deleteAPIKeyAction } from "@/zap/actions/ai/delete-api-key.action";
import { getAISettingsAction } from "@/zap/actions/ai/get-ai-settings.action";
import { saveAISettingsAction } from "@/zap/actions/ai/save-ai-settings.action";
import { saveOrUpdateAISettingsAction } from "@/zap/actions/ai/save-or-update-ai-settings.action";
import { testAPIKeyAction } from "@/zap/actions/ai/test-api-key.action";
import { updateAISettingsAction } from "@/zap/actions/ai/update-ai-settings.action";
import {
  InputDeleteAPIKeySchema,
  InputGetAPIKeySchema,
  InputSaveAPIKeySchema,
  InputTestAPIKeySchema,
  InputUpdateAPIKeySchema,
} from "@/zap/schemas/ai.schema";

const getAISettings = base
  .use(authMiddleware)
  .input(InputGetAPIKeySchema)
  .handler(getAISettingsAction);

const saveAISettings = base
  .use(authMiddleware)
  .input(InputSaveAPIKeySchema)
  .handler(saveAISettingsAction);

const updateAISettings = base
  .use(authMiddleware)
  .input(InputUpdateAPIKeySchema)
  .handler(updateAISettingsAction);

const deleteAPIKey = base
  .use(authMiddleware)
  .input(InputDeleteAPIKeySchema)
  .handler(deleteAPIKeyAction);

const saveOrUpdateAISettings = base
  .use(authMiddleware)
  .input(InputSaveAPIKeySchema)
  .handler(saveOrUpdateAISettingsAction);

const testAPIKey = base
  .use(authMiddleware)
  .input(InputTestAPIKeySchema)
  .handler(testAPIKeyAction);

export const ai = {
  getAISettings,
  saveAISettings,
  updateAISettings,
  deleteAPIKey,
  saveOrUpdateAISettings,
  testAPIKey,
};
