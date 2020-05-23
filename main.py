# -*- coding: utf-8 -*-  

from bs4 import BeautifulSoup
import urllib2

if __name__ == '__main__':
    c = urllib2.urlopen('https://github.com/ruanyf/weekly/blob/master/README.md')
    soup = BeautifulSoup(c.read(), "html.parser")
    en_list = soup.find_all('a')
    
    for en in en_list:         
        print(en)
        # if en.string and u"第" in en.string:            
            # parase_content = 'https://github.com%s'%en['href']
            # print(parase_content)
            # test_url(parase_content)
            # break