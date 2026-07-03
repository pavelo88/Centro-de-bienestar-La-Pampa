'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/enhance-technical-request-flow.ts';
import '@/ai/flows/process-dictation-flow.ts';
import '@/ai/flows/split-technical-report-flow.ts';
import '@/ai/flows/site-assistant-flow.ts';
