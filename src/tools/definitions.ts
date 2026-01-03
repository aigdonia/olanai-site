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
 * capture_lead tool - Captures qualified lead information for Olanai Tech
 *
 * This tool is triggered when the AI Strategist has validated:
 * - User's email address
 * - Clear project intent/need
 * - Basic BANT qualification (Budget, Authority, Need, Timeline)
 */
export const captureLeadTool = toolDefinition({
  name: 'capture_lead' as const,
  description: 'Capture a qualified lead after validating email and project intent. Only use when the user has provided a valid email and expressed clear interest in working with Olanai.',
  inputSchema: captureLeadInputSchema,
  outputSchema: captureLeadOutputSchema,
});
