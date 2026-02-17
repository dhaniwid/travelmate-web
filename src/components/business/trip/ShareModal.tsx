'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Trash2, Crown } from 'lucide-react';
import { collaborationService } from '@/services/collaborationService';
import { Collaborator } from '@/types';
import { toast } from 'sonner';
import { useAuth } from '@clerk/nextjs';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    tripId: string;
    currentUserRole?: string; // e.g. 'owner', 'editor'
    currentUserId?: string;
}

export default function ShareModal({ isOpen, onClose, tripId, currentUserRole, currentUserId }: ShareModalProps) {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('editor');
    const [isLoading, setIsLoading] = useState(false);
    const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const { getToken } = useAuth();

    useEffect(() => {
        if (isOpen) {
            fetchCollaborators();
        }
    }, [isOpen, tripId]);

    const fetchCollaborators = async () => {
        try {
            setIsFetching(true);
            const token = await getToken();
            const data = await collaborationService.getCollaborators(token || '', tripId);
            setCollaborators(data);
        } catch (error) {
            console.error('Failed to fetch collaborators', error);
            // toast.error('Check console for details'); // Silent fail or show toast
        } finally {
            setIsFetching(false);
        }
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        try {
            setIsLoading(true);
            const token = await getToken();
            await collaborationService.inviteUser(token || '', tripId, email, role);
            toast.success('Invitation sent successfully!');
            setEmail('');
            fetchCollaborators(); // Refresh list
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Failed to invite user. Make sure they are registered.';
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemove = async (userId: string) => {
        if (!confirm('Are you sure you want to remove this person?')) return;
        try {
            const token = await getToken();
            await collaborationService.removeCollaborator(token || '', tripId, userId);
            toast.success('Collaborator removed.');
            setCollaborators(prev => prev.filter(c => c.user_id !== userId));
        } catch (error) {
            toast.error('Failed to remove collaborator.');
        }
    };

    const handleLeave = async () => {
        if (!confirm('Are you sure you want to leave this trip?')) return;
        try {
            if (currentUserId) {
                const token = await getToken();
                await collaborationService.removeCollaborator(token || '', tripId, currentUserId);
                toast.success('You have left the trip.');
                onClose();
                // Ideally redirect to dashboard: window.location.href = '/dashboard';
            }
        } catch (error) {
            toast.error('Failed to leave trip.');
        }
    };

    const canInvite = currentUserRole === 'owner' || currentUserRole === 'editor';
    const isOwner = currentUserRole === 'owner';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white">
                <DialogHeader>
                    <DialogTitle>Share Trip</DialogTitle>
                </DialogHeader>

                {canInvite && (
                    <form onSubmit={handleInvite} className="flex gap-2 mb-4">
                        <Input
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="flex-1"
                        />
                        <Select value={role} onValueChange={setRole}>
                            <SelectTrigger className="w-[110px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className='bg-white'>
                                <SelectItem value="editor">Editor</SelectItem>
                                <SelectItem value="viewer">Viewer</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Invite'}
                        </Button>
                    </form>
                )}

                <div className="space-y-4">
                    <h4 className="text-sm font-medium text-slate-500">People with access</h4>
                    {isFetching ? (
                        <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
                    ) : (
                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                            {collaborators.map((collab) => (
                                <div key={collab.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 border border-indigo-200 shadow-sm overflow-hidden">
                                            {collab.user?.avatar_url ? (
                                                <img src={collab.user.avatar_url} alt={collab.user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                (collab.user?.name?.[0]?.toUpperCase() || '?')
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900 leading-tight">
                                                {collab.user?.name || 'Unknown User'}
                                                {collab.user_id === currentUserId && <span className="text-slate-400 font-normal ml-1">(You)</span>}
                                            </p>
                                            <p className="text-xs text-slate-500">{collab.user?.email || '-'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize flex items-center gap-1 ${collab.role === 'owner' ? 'bg-amber-100 text-amber-700' :
                                            collab.role === 'editor' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {collab.role === 'owner' && <Crown className="w-3 h-3 text-amber-600" />}
                                            {collab.role}
                                        </span>

                                        {isOwner && collab.role !== 'owner' && (
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleRemove(collab.user_id)}>
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {!isOwner && (
                    <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                        <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200" onClick={handleLeave}>
                            Leave Trip
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
