<?php

class URLMetaData {


	public static function getMetaData($url, $scrapePage = true) {

		if (!filter_var($url, FILTER_VALIDATE_URL)) {
			return false;
		}

		try {
			$meta=get_meta_tags($url);

			if ($scrapePage) {

				$page=file_get_contents($url);
				
				// find where the title CONTENT begins
				$titleStart=stripos($page,'<title>');
				if ($titleStart !== false) {
					$titleStart += 7;
					// find how long the title is
					$titleLength=stripos($page,'</title>')-$titleStart;
					// extract title from $page
					$meta['title']=substr($page,$titleStart,$titleLength);
				}

				preg_match('/<meta property="og:image" content="(.*?)"/', $page, $match);
				if (count($match) > 0) {
					$meta['image'] = $match[1];
				} 
			}

			foreach ($meta as $key=>$value) {
				$meta[strtolower($key)] = $meta[$key];
			}

			$meta['title'] = (isset($meta['title'])) ? $meta['title'] : str_replace('http://', '', $url);
			$meta['description'] = (isset($meta['description'])) ? $meta['description'] : '';
			$meta['image'] = (isset($meta['image'])) ? $meta['image'] : '';

		} catch (Exception $e) {

			return false;
		}

		return $meta;

	}

}

?>