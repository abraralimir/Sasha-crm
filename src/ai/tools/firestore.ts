'use server';
/**
 * @fileoverview Genkit tools for interacting with the Firestore database.
 * These tools are intended for use by the AI model to fetch real-time data.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    // projectId and other credentials will be automatically picked up from the environment
    // when deployed on Google Cloud infrastructure like Firebase App Hosting.
  });
}

const db = admin.firestore();

// Tool to get all leads
export const getLeadsTool = ai.defineTool(
  {
    name: 'getLeads',
    description: 'Retrieves a list of all leads from the database. Use this to answer questions about leads.',
    inputSchema: z.object({}),
    outputSchema: z.array(
      z.object({
        id: z.string(),
        contactName: z.string(),
        companyName: z.string(),
        email: z.string(),
        status: z.string(),
        potentialRevenue: z.number().optional(),
        lastContacted: z.string(),
      })
    ),
  },
  async () => {
    console.log('getLeadsTool invoked');
    try {
        const leadsSnapshot = await db.collection('leads').get();
        if (leadsSnapshot.empty) {
            return [];
        }
        return leadsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                contactName: data.contactName || '',
                companyName: data.companyName || '',
                email: data.email || '',
                status: data.status || '',
                potentialRevenue: data.potentialRevenue,
                lastContacted: data.lastContacted?.toDate()?.toISOString() || new Date().toISOString(),
            }
        });
    } catch (error) {
        console.error("Error fetching leads:", error);
        // It's better to return an empty array or throw an error that the LLM can interpret
        return [];
    }
  }
);

// Tool to get all tasks (tickets)
export const getTasksTool = ai.defineTool(
  {
    name: 'getTasks',
    description: 'Retrieves a list of all tasks (also called tickets) from the database. Can be filtered by assignee name or status. Use this to answer questions about tasks or tickets.',
    inputSchema: z.object({
        assigneeName: z.string().optional().describe("Filter tasks by the name of the person they are assigned to."),
        status: z.enum(['To Do', 'In Progress', 'Done']).optional().describe("Filter tasks by their current status."),
    }),
    outputSchema: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string().optional(),
        status: z.string(),
        assigneeName: z.string().optional(),
        createdAt: z.string(),
      })
    ),
  },
  async (input) => {
    console.log('getTasksTool invoked with input:', input);
    try {
        let query: admin.firestore.Query = db.collection('tasks');
        
        if (input.assigneeName) {
            query = query.where('assigneeName', '==', input.assigneeName);
        }
        if (input.status) {
            query = query.where('status', '==', input.status);
        }

        const tasksSnapshot = await query.get();
        if (tasksSnapshot.empty) {
            return [];
        }
        return tasksSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                title: data.title || '',
                description: data.description,
                status: data.status || '',
                assigneeName: data.assigneeName,
                createdAt: data.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
            }
        });
    } catch (error) {
        console.error("Error fetching tasks:", error);
        return [];
    }
  }
);
