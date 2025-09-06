export const playBase64Audio = (base64Audio, format = 'wav') => {
  try {
    const audioSrc = `data:audio/${format};base64,${base64Audio}`;
    const audio = new Audio(audioSrc);

    return new Promise((resolve, reject) => {
      audio.addEventListener('ended', () => resolve());
      audio.addEventListener('error', (e) => reject(e));
      audio.play().catch(reject);
    });
  } catch (error) {
    console.error('Erro ao reproduzir áudio:', error);
    throw error;
  }
};

export const downloadBase64Audio = (base64Audio, filename = 'audio', format = 'wav') => {
  try {
    const link = document.createElement('a');
    link.href = `data:audio/${format};base64,${base64Audio}`;
    link.download = `${filename}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Erro ao baixar áudio:', error);
  }
};
