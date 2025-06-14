// src/app/components/Global/AsciiLogger.tsx

"use client";

import { useEffect } from 'react';

export default function AsciiLogger() {
  useEffect(() => {
    // Define ASCII art
    const asciiArt = `
        MMMMMMMM               MMMMMMMM                                                              KKKKKKKKK    KKKKKKK                  lllllll         tttt          
        M:::::::M             M:::::::M                                                              K:::::::K    K:::::K                  l:::::l      ttt:::t          
        M::::::::M           M::::::::M                                                              K:::::::K    K:::::K                  l:::::l      t:::::t          
        M:::::::::M         M:::::::::M                                                              K:::::::K   K::::::K                  l:::::l      t:::::t          
        M::::::::::M       M::::::::::M    eeeeeeeeeeee       mmmmmmm    mmmmmmm       eeeeeeeeeeee  KK::::::K  K:::::KKKuuuuuu    uuuuuu   l::::lttttttt:::::ttttttt    
        M:::::::::::M     M:::::::::::M  ee::::::::::::ee   mm:::::::m  m:::::::mm   ee::::::::::::ee  K:::::K K:::::K   u::::u    u::::u   l::::lt:::::::::::::::::t    
        M:::::::M::::M   M::::M:::::::M e::::::eeeee:::::eem::::::::::mm::::::::::m e::::::eeeee:::::eeK::::::K:::::K    u::::u    u::::u   l::::lt:::::::::::::::::t    
        M::::::M M::::M M::::M M::::::Me::::::e     e:::::em::::::::::::::::::::::me::::::e     e:::::eK:::::::::::K     u::::u    u::::u   l::::ltttttt:::::::tttttt    
        M::::::M  M::::M::::M  M::::::Me:::::::eeeee::::::em:::::mmm::::::mmm:::::me:::::::eeeee::::::eK:::::::::::K     u::::u    u::::u   l::::l      t:::::t          
        M::::::M   M:::::::M   M::::::Me:::::::::::::::::e m::::m   m::::m   m::::me:::::::::::::::::e K::::::K:::::K    u::::u    u::::u   l::::l      t:::::t          
        M::::::M    M:::::M    M::::::Me::::::eeeeeeeeeee  m::::m   m::::m   m::::me::::::eeeeeeeeeee  K:::::K K:::::K   u::::u    u::::u   l::::l      t:::::t          
        M::::::M     MMMMM     M::::::Me:::::::e           m::::m   m::::m   m::::me:::::::e         KK::::::K  K:::::KKKu:::::uuuu:::::u   l::::l      t:::::t    tttttt
        M::::::M               M::::::Me::::::::e          m::::m   m::::m   m::::me::::::::e        K:::::::K   K::::::Ku:::::::::::::::uul::::::l     t::::::tttt:::::t
        M::::::M               M::::::M e::::::::eeeeeeee  m::::m   m::::m   m::::m e::::::::eeeeeeeeK:::::::K    K:::::K u:::::::::::::::ul::::::l     tt::::::::::::::t
        M::::::M               M::::::M  ee:::::::::::::e  m::::m   m::::m   m::::m  ee:::::::::::::eK:::::::K    K:::::K  uu::::::::uu:::ul::::::l       tt:::::::::::tt
        MMMMMMMM               MMMMMMMM    eeeeeeeeeeeeee  mmmmmm   mmmmmm   mmmmmm    eeeeeeeeeeeeeeKKKKKKKKK    KKKKKKK    uuuuuuuu  uuuullllllll         ttttttttttt  
        `;

    const asciiArtStyle = 'color: #818cf8; font-weight: bold; text-shadow: 1px 1px 0 rgba(0,0,0,0.3);';
    
    // Log the ASCII art with style
    console.log('%c' + asciiArt, asciiArtStyle);
  }, []);

  return null;
}