import axios, { AxiosResponse } from "axios";
import { _getLatestRealeaseTag, _getLatestReleaseFile, selfUpdate } from "../src/update"

jest.mock('axios')
const mockedAxios = jest.mocked(axios)

const headers = {
    'Accept': 'application/vnd.github.v3+json'
}

describe('selfUpdate', () => {
    it('should get latest release tag from GitHub', async () => {
        const response: any = {
            data: {
                tag_name: '1.3.6',
                assets: []
            }
        }
        mockedAxios.mockResolvedValueOnce(response)
        const tag = await _getLatestRealeaseTag()
        expect(tag).toBe('1.3.6')
        expect(mockedAxios).toBeCalledWith({
            method: 'GET',
            url: 'https://api.github.com/repos/zebra-group/directus-extension-installer/releases/latest',
            headers
        })
    })
})
