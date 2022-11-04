import { useState, useMemo, useCallback, useContext } from 'react';
import { create as ipfsHttpClient } from 'ipfs-http-client';
import { useRouter } from 'next/router';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { useTheme } from 'next-themes';

import { NFTContext } from '../context/NFTContext';
import { Button, Input, Loader } from '../components';
import images from '../assets';

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0');

const CreateItem = () => {
  const { createSale, isLoadingNFT } = useContext(NFTContext);
  const [fileUrl, setFileUrl] = useState(null);
  const { theme } = useTheme();

  const uploadToInfura = async (file) => {
    try {
      const added = await client.add({ content: file });

      const url = `https://ipfs.infura.io/ipfs/${added.path}`;

      setFileUrl(url);
    } catch (error) {
      console.log('Error uploading file: ', error);
    }
  };

  const onDrop = useCallback(async (acceptedFile) => {
    await uploadToInfura(acceptedFile[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept: 'image/*',
    maxSize: 5000000,
  });

  // add tailwind classes acording to the file status
  const fileStyle = useMemo(
    () => (
      `dark:bg-nft-black-1 bg-white border dark:border-white border-nft-gray-2 flex flex-col items-center p-5 rounded-sm border-dashed  
       ${isDragActive ? ' border-file-active ' : ''} 
       ${isDragAccept ? ' border-file-accept ' : ''} 
       ${isDragReject ? ' border-file-reject ' : ''}`),
    [isDragActive, isDragReject, isDragAccept],
  );

  const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' });
  const router = useRouter();

  const createMarket = async () => {
    const { name, description, price } = formInput;
    if (!name || !description || !price || !fileUrl) return;
    /* first, upload to IPFS */
    const data = JSON.stringify({ name, description, image: fileUrl });
    try {
      const added = await client.add(data);
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      /* after file is uploaded to IPFS, pass the URL to save it on Polygon */
      await createSale(url, formInput.price);
      router.push('/');
    } catch (error) {
      console.log('Error uploading file: ', error);
    }
  };

  if (isLoadingNFT) {
    return (
      <div className="flexCenter" style={{ height: '51vh' }}>
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex justify-center sm:px-4 p-12">
      <div className="w-3/5 md:w-full">
        <h1 className="font-poppins dark:text-white text-nft-black-1 font-semibold text-2xl">Create new item</h1>

        <div className="mt-16">
          <p className="font-poppins dark:text-white text-nft-black-1 font-semibold text-xl">Upload file</p>
          <div className="mt-4">
            <div {...getRootProps()} className={fileStyle}>
              <input {...getInputProps()} />
              <div className="flexCenter flex-col text-center">
                <p className="font-poppins dark:text-white text-nft-black-1 font-semibold text-xl">JPG, PNG, GIF, SVG, WEBM, MP3, MP4. Max 100mb.</p>

                <div className="my-12 w-full flex justify-center">
                  <Image
                    src={images.upload}
                    width={100}
                    height={100}
                    objectFit="contain"
                    alt="file upload"
                    className={theme === 'light' ? 'filter invert' : undefined}
                  />
                </div>

                <p className="font-poppins dark:text-white text-nft-black-1 font-semibold text-sm">Drag and Drop File</p>
                <p className="font-poppins dark:text-white text-nft-black-1 font-semibold text-sm mt-2">Or browse media on your device</p>
              </div>
            </div>
            {fileUrl && (
              <aside>
                <div>
                  <img
                    src={fileUrl}
                    alt="Asset_file"
                  />
                </div>
              </aside>
            )}
          </div>
        </div>

        <Input
          inputType="input"
          title="Name"
          placeholder="Asset Name"
          handleClick={(e) => updateFormInput({ ...formInput, name: e.target.value })}
        />

        <Input
          inputType="textarea"
          title="Description"
          placeholder="Asset Description"
          handleClick={(e) => updateFormInput({ ...formInput, description: e.target.value })}
        />

        <Input
          inputType="number"
          title="Price"
          placeholder="Asset Price"
          handleClick={(e) => updateFormInput({ ...formInput, price: e.target.value })}
        />

        <div className="mt-7 w-full flex justify-end">
          <Button
            btnName="Create Item"
            btnType="primary"
            classStyles="rounded-xl"
            handleClick={createMarket}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateItem;
