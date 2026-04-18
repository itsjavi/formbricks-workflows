import { data } from 'react-router'

import type { Workflow } from '@/lib/workflows/schema'
import { createBlankWorkflow } from '@/lib/workflows/utils'
import type { User } from './types'

// this would be a simple in-memory store, mocking a DB
// it doesn't work well on serverless (e.g. vercel) and memory is lost on cold starts
const db = {
  workflows: new Map<string, Workflow>(),
  users: new Map<string, User>([
    [
      'usr_1',
      {
        id: 'usr_1',
        name: 'Javier',
        email: 'javier@acme.test',
        avatarUrl: null,
      },
    ],
  ]),
  aiSettings: {
    enabled: true,
    model: 'gpt-5.4-mini', // 'gpt-5.4-nano', 'gpt-5.4-mini', 'gpt-5.4'
  },
}

const workflowTable = {
  all(): Workflow[] {
    return Array.from(db.workflows.values())
  },
  get(id: string): Workflow | undefined {
    return db.workflows.get(id)
  },
  set(workflow: Workflow): Workflow {
    db.workflows.set(workflow.id, workflow)
    return workflow
  },
  delete(id: string): boolean {
    return db.workflows.delete(id)
  },
}

// -----
// a thin service layer for the PoC

export function listWorkflows(): Workflow[] {
  return workflowTable.all().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export function getWorkflow(id: string): Workflow {
  const workflow = workflowTable.get(id)
  if (!workflow) {
    throw data({ message: 'Workflow not found' }, { status: 404 })
  }
  return workflow
}

export function createWorkflow(input: { ownerId: string }): Workflow {
  return workflowTable.set(createBlankWorkflow(input))
}

export function updateWorkflow(workflow: Workflow): Workflow {
  return workflowTable.set({ ...workflow, updatedAt: new Date().toISOString() })
}

export function deleteWorkflow(id: string): boolean {
  return workflowTable.delete(id)
}

export function getCurrentUser(): User {
  return db.users.get('usr_1')!
}

// -----
// AI stuff

function getOpenAiApiKey(): string | null {
  return process.env.OPENAI_API_KEY || null
}

export function isAiEnabled(): boolean {
  return db.aiSettings.enabled && getOpenAiApiKey() !== null
}

export function setAiEnabled(enabled: boolean): void {
  db.aiSettings.enabled = enabled
}

export function hasOpenAiApiKey(): boolean {
  return getOpenAiApiKey() !== null
}

// -----
// seeding mock data

function seedMockData() {
  const now = new Date().toISOString()

  // example1: if the NPS score of this survey is greater than or equal to 8, send a message to the #promoters channel
  const promotersToSlack: Workflow = {
    id: 'wf_nps_promoters',
    name: 'NPS promoters to Slack',
    status: 'enabled',
    trigger: {
      type: 'survey.response.created',
      surveyId: 'srv_nps_1',
    },
    conditions: [
      {
        id: 'c_nps_gte_8',
        left: { $ref: 'answers.nps' },
        operator: 'gte',
        right: 8,
      },
    ],
    actions: [
      {
        id: 'a_slack_1',
        integration: 'slack',
        operation: 'sendChannelMessage',
        config: {
          channel: '#promoters',
          text: 'Nice NPS {{answers.nps}} from {{response.email}}',
        },
      },
    ],
    ownerId: 'usr_1',
    updatedAt: now,
  }

  // example 2: a draft workflow for triaging bug reports. it has no conditions, so it will always run
  const bugReportDraft: Workflow = {
    id: 'wf_bug_report_draft',
    name: 'Bug report triage',
    status: 'draft',
    trigger: null,
    conditions: [],
    actions: [],
    ownerId: 'usr_1',
    updatedAt: now,
  }

  db.workflows.set(promotersToSlack.id, promotersToSlack)
  db.workflows.set(bugReportDraft.id, bugReportDraft)
}

if (db.workflows.size === 0) {
  seedMockData()
}
