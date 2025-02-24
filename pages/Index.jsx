// Dans ton composant ou ta page, par exemple /pages/index.js
import { supabase } from '../lib/supabaseClient';

const HomePage = () => {
  // Exemple d'utilisation de supabase
  const fetchData = async () => {
    const { data, error } = await supabase.from('table_name').select('*');
    if (error) console.error(error);
    else console.log(data);
  };

  if (!session || !session.user.isAdmin) {
    return <p>Accès refusé, vous n'êtes pas administrateur.</p>;
  }
  

  return (
    <div>
      <h1>Welcome to the Game!</h1>
      <button onClick={fetchData}>Fetch Data</button>
    </div>
  );
};

export default HomePage;
