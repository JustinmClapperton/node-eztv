// @flow
import fetch from 'isomorphic-fetch';
import cheerio from 'cheerio';
import string from 'string';


/**
 * @NOTE: An alternative API endpoint is https://eztv-proxy.net
 */
const urlRoot = 'https://eztv.unblocked.stream';

function getShows(itemTitle: string, options: Object = {}) {
  return fetch(`${urlRoot}/showlist/`)
    .then(res => res.text())
    .then(res => {
      const $ = cheerio.load(res);
      const elements = $('table.forum_header_border tr[name=hover]');

      return elements
        .filter(function filterElements() {
          const url = $(this).find('.forum_thread_post a').attr('href');
          const regex = url.match(/\/shows\/(\d+)\/([^\/]+)/);
          const title = $(this).find('.forum_thread_post a').text();

          return (
            !!url &&
            regex &&
            title
          );
        })
        .map(function mapElements(element) {
          const url = $(this).find('.forum_thread_post a').attr('href');
          const title = $(this).find('.forum_thread_post a').text();
          const status = $(element)
            .find('td')
            .eq(2)
            .find('font')
            .attr('class');

          return { url, title, status };
        })
        .get();
    })
    .catch((err) => {
      console.log(err);
    });
}

function getShowEpisodes(showId: string) {
  return fetch(`${urlRoot}shows/${showId}/`)
    .then(res => res.text())
    .then(res => {
      const result = {
        id: showId,
        episodes: []
      };

      const $ = cheerio.load(res);
      const title = $('td.section_post_header').eq(0).find('b').text();
      const episodes = $('table.forum_header_noborder tr[name=hover]');

      episodes
        .filter(element => {
          const url = $(element)
            .find('td')
            .eq(1)
            .find('a')
            .attr('href');

          return (
            !!url
          );
        })
        .map((index, element) => {
          const url = $(element)
            .find('td')
            .eq(1)
            .find('a')
            .attr('href');

          // const urlRegex = url.match(/\/ep\/(\d+)\/.*/);
          const _title = $(element)
            .find('td')
            .eq(1)
            .find('a')
            .text();

          // const titleRegex = title.match(/(.+) s?(\d+)[ex](\d+)(e(\d+))?(.*)/i);
          //
          // if (titleRegex) {
          //   const show = titleRegex[1];
          //   const seasonNumber = parseInt(titleRegex[2], 10);
          //   const episodeNumber = parseInt(titleRegex[3], 10);
          //   const episodeNumber2 = parseInt(titleRegex[5], 10);
          //   const extra = titleRegex[6].trim();
          //   const proper = extra.toLowerCase().indexOf('proper') >= 0;
          //   const repack = extra.toLowerCase().indexOf('repack') >= 0;
          // }

          const size = String($(element).find('td').eq(3).text());
          const magnet = $(element)
            .find('td')
            .eq(2)
            .find('a.magnet')
            .attr('href');

          const torrentURL = $(element)
            .find('td')
            .eq(2)
            .find('a.download_1')
            .attr('href');

          return { url, torrentURL, magnet, size, _title };
        });
    })
    .catch((err) => {
      console.log(err);
    });
}

export default { getShowEpisodes, getShows };
