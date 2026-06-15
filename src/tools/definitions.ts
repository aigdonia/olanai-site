import { toolDefinition } from '@tanstack/ai';
import { z } from 'zod';

/**
 * Input schema for capture_lead tool
 */
export const captureLeadInputSchema = z.object({
  name: z.string().min(2).describe('Full name of the lead'),
  email: z.string().email().describe('Valid email address'),
  projectSummary: z.string().min(10).describe('Brief summary of the project or need'),
  budget: z.enum(['under_10k', '10k_25k', '25k_50k', '50k_100k', 'over_100k', 'not_specified'])
    .optional()
    .describe('Estimated project budget range'),
  priority: z.enum(['urgent', 'high', 'medium', 'low', 'not_specified'])
    .optional()
    .describe('How urgent is this project'),
  timeline: z.string().optional().describe('Expected project timeline'),
  companyName: z.string().optional().describe('Company or organization name'),
  serviceCategory: z.enum(['full_product', 'internal_tools', 'ai_integration', 'team_augmentation', 'other'])
    .optional()
    .describe('Which OlanAI service best matches the need'),
  fitScore: z.enum(['hot', 'warm', 'cold'])
    .describe('Lead quality so the team can prioritise: hot = clear need + budget + timeline + decision authority; warm = real need but one or more of budget/timeline/authority unconfirmed; cold = early-stage, exploring, or weak fit'),
  fitReason: z.string().min(3).describe('One short line explaining the fit score'),
  additionalNotes: z.string().optional().describe('Any additional context from the conversation'),
});

/**
 * Output schema for capture_lead tool
 */
export const captureLeadOutputSchema = z.object({
  success: z.boolean().describe('Whether the lead was captured successfully'),
  message: z.string().describe('Confirmation message for the user'),
  leadId: z.string().optional().describe('Unique identifier for the captured lead'),
});

/**
 * Type exports for use in components
 */
export type CaptureLeadInput = z.infer<typeof captureLeadInputSchema>;
export type CaptureLeadOutput = z.infer<typeof captureLeadOutputSchema>;

/**
 * Plain JSON Schema for the tool parameters, used as the tool's inputSchema.
 *
 * IMPORTANT: @tanstack/ai-gemini@0.2.0 forwards `tool.inputSchema` to Gemini as the
 * function-declaration `parameters` WITHOUT converting Standard schemas (Zod) to JSON
 * Schema. Passing a raw Zod object makes Gemini silently drop the function (it never gets
 * called). So we hand off a clean, Gemini-compatible JSON Schema here (types/enums/required
 * only — no $schema, format, minLength, or additionalProperties, which Gemini rejects).
 *
 * Keep this in sync with `captureLeadInputSchema` above (that schema stays the source of the
 * CaptureLeadInput TypeScript type).
 */
export const captureLeadParametersSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', description: 'Full name of the lead' },
    email: { type: 'string', description: 'Valid email address provided by the lead' },
    projectSummary: { type: 'string', description: 'Brief summary of the project or need' },
    budget: {
      type: 'string',
      enum: ['under_10k', '10k_25k', '25k_50k', '50k_100k', 'over_100k', 'not_specified'],
      description: 'Estimated project budget range',
    },
    priority: {
      type: 'string',
      enum: ['urgent', 'high', 'medium', 'low', 'not_specified'],
      description: 'How urgent the project is',
    },
    timeline: { type: 'string', description: 'Expected project timeline' },
    companyName: { type: 'string', description: 'Company or organization name' },
    serviceCategory: {
      type: 'string',
      enum: ['full_product', 'internal_tools', 'ai_integration', 'team_augmentation', 'other'],
      description: 'Which OlanAI service best matches the need',
    },
    fitScore: {
      type: 'string',
      enum: ['hot', 'warm', 'cold'],
      description: 'Lead quality for prioritisation: hot = clear need + budget + timeline + decision authority; warm = real need but one of budget/timeline/authority unconfirmed; cold = early-stage, exploring, or weak fit',
    },
    fitReason: { type: 'string', description: 'One short line explaining the fit score' },
    additionalNotes: { type: 'string', description: 'Any additional context from the conversation' },
  },
  required: ['name', 'email', 'projectSummary', 'fitScore', 'fitReason'],
} as const;

/**
 * capture_lead tool - Captures qualified lead information for Olanai Tech
 *
 * This tool is triggered when Olan has validated:
 * - User's email address
 * - Clear project intent/need
 * - Basic BANT qualification (Budget, Authority, Need, Timeline)
 */
export const captureLeadTool = toolDefinition({
  name: 'capture_lead' as const,
  description: 'Capture a qualified lead after validating email and project intent. Only use when the user has provided a valid email and expressed clear interest in working with Olanai.',
  inputSchema: captureLeadParametersSchema,
  outputSchema: captureLeadOutputSchema,
});
