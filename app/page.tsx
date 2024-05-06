import dynamic from 'next/dynamic';


const Page = dynamic(() => import('./App'), { ssr: false });

export default Page;