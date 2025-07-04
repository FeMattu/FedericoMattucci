'use server';

/**
 * Funzione server per ottenere l'elenco delle immagini da precaricare
 * @param folderPath Percorso della cartella contenente le immagini
 * @returns Array di URL delle immagini
 */
export async function getImagesForPrefetching(folderPath: string): Promise<string[]> {
  try {
    // Esegui la chiamata all'API per ottenere l'elenco delle immagini
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/api/images-list?folder=${encodeURIComponent(folderPath)}`, {
      cache: 'force-cache',
      next: {
        revalidate: 60 * 60 * 24, // 24 ore
      },
    });
    
    if (!response.ok) {
      throw new Error(`Errore nel recupero delle immagini: ${response.status}`);
    }
    
    const data = await response.json();
    return data.images.map((img: any) => img.url);
  } catch (error) {
    console.error('Errore nel prefetching delle immagini:', error);
    return [];
  }
}
