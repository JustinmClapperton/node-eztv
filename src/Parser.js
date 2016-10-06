// @flow
import fetch from 'isomorphic-fetch';
import cheerio from 'cheerio';
import string from 'string';


/**
 * @NOTE: An alternative API endpoint is https://eztv-proxy.net
 */
const urlRoot = 'https://eztv.ag';

function getShows(options: Object) {
  return fetch('https://eztv.ag/showlist/')
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
  request(`${urlRoot}shows/${showId}/`, (error, response, res) => {
    if (!error && response.statusCode === 200) {
      const result = {
        id: showId,
        episodes: []
      };

      const $ = cheerio.load(res);

      result.title = $('td.section_post_header').eq(0).find('b').text();

      const $episodes = $('table.forum_header_noborder tr[name=hover]');
      $episodes.each((i, e) => {
        const episode = {};

        episode.url = $(e)
          .find('td')
          .eq(1)
          .find('a')
          .attr('href');

        if (!episode.url) return;
        const urlRegex = episode.url.match(/\/ep\/(\d+)\/.*/);
        if (urlRegex) {
          episode.id = parseInt(urlRegex[1], 10);
        }

        episode.title = $(e)
          .find('td')
          .eq(1)
          .find('a')
          .text();

        const titleRegex = episode.title.match(/(.+) s?(\d+)[ex](\d+)(e(\d+))?(.*)/i);

        if (titleRegex) {
          episode.show = titleRegex[1];
          episode.seasonNumber = parseInt(titleRegex[2], 10);
          episode.episodeNumber = parseInt(titleRegex[3], 10);
          episode.episodeNumber2 = parseInt(titleRegex[5], 10);
          episode.extra = titleRegex[6].trim();
          episode.proper = episode.extra.toLowerCase().indexOf('proper') >= 0;
          episode.repack = episode.extra.toLowerCase().indexOf('repack') >= 0;
        }

        episode.size = String($(e).find('td').eq(3).text());
        episode.magnet = $(e)
          .find('td')
          .eq(2)
          .find('a.magnet')
          .attr('href');

        episode.torrentURL = $(e)
          .find('td')
          .eq(2)
          .find('a.download_1')
          .attr('href');

        result.episodes.push(episode);
      });
    }
  });
}

export default { getShowEpisodes, getShows };
