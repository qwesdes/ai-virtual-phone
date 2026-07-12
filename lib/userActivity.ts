import { supabase } from './supabaseClient';

export const updateUserActivity = async (userId: string) => {
  try {
    const { error } = await supabase
      .from('user_activity')
      .upsert({ user_id: userId, last_seen: new Date().toISOString() }, { onConflict: 'user_id' });

    if (error) {
      console.error('Error updating user activity:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Exception updating user activity:', error);
    return false;
  }
};
