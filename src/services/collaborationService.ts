import { api } from '@/lib/api';
import { Collaborator } from '@/types';

export const collaborationService = {
    // 1. Get Collaborators
    getCollaborators: async (token: string, tripId: string): Promise<Collaborator[]> => {
        const response = await api.get(`/trips/${tripId}/collaborators`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.collaborators;
    },

    // 2. Invite User
    inviteUser: async (token: string, tripId: string, email: string, role: string): Promise<Collaborator> => {
        const response = await api.post(`/trips/${tripId}/invite`, { email, role }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    // 3. Remove Collaborator
    removeCollaborator: async (token: string, tripId: string, userId: string): Promise<void> => {
        await api.delete(`/trips/${tripId}/collaborators/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    },

    // 4. Update Role
    updateRole: async (token: string, tripId: string, userId: string, role: string): Promise<void> => {
        await api.put(`/trips/${tripId}/collaborators/${userId}`, { role }, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }
};
