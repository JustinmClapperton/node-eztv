/* eslint new-cap: 0 */
import request from 'request';
import cheerio from 'cheerio';
import S from 'string';


const urlRoot = 'https://eztv.ch/';
// var urlRoot = "https://eztv-proxy.net/";

function getShows(options) {
  request(`${urlRoot}showlist/`, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const list = [];
      const $ = cheerio.load(body);
      const elements = $('table.forum_header_border tr[name=hover]');

      elements.each((i, e) => {
        const show = {};

        show.url = $(e)
          .find('td')
          .eq(0)
          .find('a')
          .attr('href');

        if (!show.url) {
          return;
        }
        const regex = show.url.match(/\/shows\/(\d+)\/([^\/]+)/);
        if (!regex) {
          return;
        }
        show.id = parseInt(regex[1], 10);
        show.slug = regex[2];

        let title = $(e).find('td').eq(0).text();

        if (S(title).endsWith(', The')) {
          title = `The ${S(title).chompRight(', The').s}`;
        }

        show.title = title;
        show.status = $(e)
          .find('td')
          .eq(2)
          .find('font')
          .attr('class');

        if (options && options.query) {
          if (show.title.toLowerCase().search(options.query.toLowerCase()) >= 0) {
            list.push(show);
          }
        } else {
          list.push(show);
        }
      });
    }
  });
}

function getShowEpisodes(showId: string) {
  request(`${urlRoot}shows/${showId}/`, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const result = {
        id: showId,
        episodes: []
      };

      const $ = cheerio.load(body);
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
