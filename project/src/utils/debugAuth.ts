import { supabase } from '../lib/supabase';

export const debugAuthStatus = async () => {
  console.log('🔍 === AUTH DEBUG START ===');
  
  try {
    // Check auth session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('📋 Session:', session ? 'EXISTS' : 'NONE');
    console.log('📋 Session error:', sessionError);
    
    if (session?.user) {
      console.log('👤 Auth User ID:', session.user.id);
      console.log('👤 Auth User Email:', session.user.email);
      console.log('👤 Auth User Metadata:', session.user.user_metadata);
      
      // Check if user exists in users table
      const { data: userRecord, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      console.log('🗄️ User Record:', userRecord);
      console.log('🗄️ User Record Error:', userError);
      
      // Test RLS policy by trying to select from books
      const { data: booksTest, error: booksError } = await supabase
        .from('books')
        .select('id')
        .limit(1);
        
      console.log('📚 Books Access Test:', booksTest ? 'SUCCESS' : 'FAILED');
      console.log('📚 Books Access Error:', booksError);
      
      // Test if we can insert a dummy record (we'll delete it immediately)
      const testBook = {
        title: 'TEST_BOOK_DELETE_ME',
        subject: 'TEST',
        semester: 1,
        author: 'TEST',
        cover_image_url: 'test',
        pdf_url: 'test',
        uploaded_by: session.user.id
      };
      
      const { data: insertTest, error: insertError } = await supabase
        .from('books')
        .insert(testBook)
        .select()
        .single();
        
      console.log('📝 Insert Test:', insertTest ? 'SUCCESS' : 'FAILED');
      console.log('📝 Insert Error:', insertError);
      
      // Clean up test record if it was created
      if (insertTest) {
        await supabase.from('books').delete().eq('id', insertTest.id);
        console.log('🗑️ Test record cleaned up');
      }
    }
  } catch (error) {
    console.error('❌ Debug error:', error);
  }
  
  console.log('🔍 === AUTH DEBUG END ===');
};